// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Host_init(db, onsuccess)
{
	var host = {}

	// Peer

    connection.addEventListener('files.list', function(files)
	{
	   files = JSON.parse(files)

		// Check if we have already any of the files
		// It's stupid to try to download it... and also give errors
		db.sharepoints_getAll(null, function(filelist)
		{
			for(var i=0, file; file = files[i]; i++)
				for(var j=0, file_hosted; file_hosted = filelist[j]; j++)
					if(file.name == file_hosted.name)
					{
						file.bitmap = file_hosted.bitmap
						file.blob   = file_hosted.blob || file_hosted

						break;
					}
	
			ui_updatefiles_peer(files)
		})
	})

	if(onsuccess)
		onsuccess(host);

	// Host

    connection.addEventListener('peer.connected', function(socket_id)
	{
		ui_peerstate("Peer connected!");

		db.sharepoints_getAll(null, host._send_files_list)

		info(socket_id + " joined!");
	})

    connection.addEventListener('peer.disconnected', function(data)
	{
		ui_peerstate("Peer disconnected.");
	})

	// Peer

	host._send_files_list = function(filelist)
	{
		var files_send = []

		for(var i = 0, file; file = filelist[i]; i++)
			files_send.push({"name": file.name, "size": file.size, "type": file.type});

        connection.emit('files.list', JSON.stringify(files_send));
	}

    host._transferbegin = function(file, onsuccess)
    {
        // Calc number of necesary chunks to download
        var chunks = file.size/chunksize;
        if(chunks % 1 != 0)
            chunks = Math.floor(chunks) + 1;

        // Add a blob container and a bitmap to our file stub
        file.blob = new Blob([''], {"type": file.type})
        file.bitmap = Bitmap(chunks)

        // Insert new "file" inside IndexedDB
        db.sharepoints_add(file,
        function(key)
        {
            if(onsuccess)
                onsuccess(chunks);

            console.log("Transfer begin: '"+key+"' = "+JSON.stringify(file))

            // Demand data from the begining of the file
            connection.emit('transfer.query', key, getRandom(file.bitmap))
        },
        function(errorCode)
        {
            console.error("Transfer begin: '"+file.name+"' is already in database.")
        })
    }

	if(onsuccess)
		onsuccess();
}