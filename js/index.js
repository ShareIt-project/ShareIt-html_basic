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
        Transport_init(new WebSocket('wss://localhost:8001'), room,
        function(signaling)
        {
            // Apply signaling "interface" events and functions to transport
            Transport_Signaling_init(signaling)

            signaling.addEventListener('joiner.success', function()
            {
			    signaling.addEventListener('peer.connected', function(socket_id)
			    {
			        ui_peerstate("Peer connected!");

			        db.sharepoints_getAll(null, signaling._send_files_list)

			        info(socket_id + " joined!");
			    })

			    signaling.addEventListener('peer.disconnected', function(data)
			    {
			        ui_peerstate("Peer disconnected.");
			    })

                // Add connection methods to host
                Host_onconnect(signaling, host, db)

                function _updatefiles(filelist)
                {
                    signaling._send_files_list(filelist)

                    ui_updatefiles_host(filelist)
                }

                db.sharepoints_getAll(null, function(filelist)
                {
                    _updatefiles(filelist)

                    // Restard downloads
                    for(var i = 0, file; file = filelist[i]; i++)
                        if(file.bitmap)
                            signaling.emit('transfer.query',
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

                ui_ready_transferbegin(host._transferbegin)
            })
	        signaling.addEventListener('joiner.error', function(type)
            {
                switch(type)
                {
                    case 'room full':
                        warning("This connection is full. Please try later.");
                }
            })

	        signaling.emit('joiner', room);
        })
	})
})