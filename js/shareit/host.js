// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Host_init(db, onsuccess)
{
	var host = {}

	// Peer

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
        // Stupid conversion because JSON.stringify() doesn't parse
        // File objects (use them as plain objects in the best case)
        // Maybe add a File.toString() method would do the trick,
        // but later would not be able to store them on IndexedDB...
        //
        // I miss you Python :-(
		var files_send = []

		for(var i = 0, file; file = filelist[i]; i++)
			files_send.push({"name": file.name, "size": file.size, "type": file.type});

        connection.emit('fileslist.send', JSON.stringify(files_send));
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