function randomString()
{
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz";
	var string_length = 8;

	var randomstring = '';
	for(var i=0; i<string_length; i++)
	{
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}

	return randomstring;
}

function Transport_Room_init(transport, onsuccess)
{
    transport.addEventListener('joiner.success', function()
    {
        transport.addEventListener('peer.connected', function(socket_id)
        {
            ui_peerstate("Peer connected!");

            db.sharepoints_getAll(null, transport._send_files_list)

            info(socket_id + " joined!");
        })

        transport.addEventListener('peer.disconnected', function(data)
        {
            ui_peerstate("Peer disconnected.");
        })

        if(onsuccess)
            onsuccess()
    })

    transport.addEventListener('joiner.error', function(type)
    {
        switch(type)
        {
            case 'room full':
                warning("This connection is full. Please try later.");
        }
    })
}


window.addEventListener("load", function()
{
	DB_init(function(db)
	{
	    var host = new Host(db)

        // Get websocket room
        if(!window.location.hash)
	        window.location.hash = '#'+randomString()

        var room = window.location.hash.substring(1)

        // Load websocket connection after IndexedDB is ready
        Transport_init(new WebSocket('wss://localhost:8001'),
        function(signaling)
        {
            // Apply signaling "interface" events and functions to transport
            Transport_Signaling_init(signaling)

            // Apply "interface" events to manage a room
            Transport_Room_init(signaling, function()
            {
		        // Add connection methods to host
		        Host_onconnect(signaling, host, db)

		        function _updatefiles(filelist)
		        {
		            transport._send_files_list(filelist)

		            ui_updatefiles_host(filelist)
		        }

		        db.sharepoints_getAll(null, function(filelist)
		        {
		            _updatefiles(filelist)

		            // Restard downloads
		            for(var i = 0, file; file = filelist[i]; i++)
		                if(file.bitmap)
		                    transport.emit('transfer.query',
		                                    file.name, getRandom(file.bitmap))
		        })

		        ui_onopen()

		        ui_ready_fileschange(function(filelist)
		        {
		            // Loop through the FileList and append files to list.
		            for(var i = 0, file; file = filelist[i]; i++)
		                db.sharepoints_add(file)

		            //signaling._send_files_list(filelist)   // Send just new files

		            db.sharepoints_getAll(null, _updatefiles)
		        })

		        ui_ready_transferbegin(transport._transferbegin)
            })

	        signaling.emit('joiner', room);
        })
	})
})