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
    // Get room
    if(!window.location.hash)
        window.location.hash = '#'+randomString()

    var room = window.location.hash.substring(1)

    Transport_init(new WebSocket('wss://localhost:8001'),
    function(signaling)
    {
        // Apply "interface" events to manage a room
        Transport_Room_init(signaling, function()
        {
            function _updatefiles(filelist)
            {
                signaling._send_files_list(filelist)

                ui_updatefiles_host(filelist)
            }

			DB_init(function(db)
			{
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
            })
        })

        // Apply signaling "interface" events and functions to transport
        Transport_Signaling_init(signaling)

        ui_setSignaling(signaling)

        signaling.emit('joiner', room);
	})
})