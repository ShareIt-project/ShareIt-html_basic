// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Host(db)
{
    EventTarget.call(this)

    var self = this

    connection.addEventListener('peer.connected', function(socket_id)
	{
		ui_peerstate("Peer connected!");

		db.sharepoints_getAll(null, transport._send_files_list)

		info(socket_id + " joined!");
	})

    connection.addEventListener('peer.disconnected', function(data)
	{
		ui_peerstate("Peer disconnected.");
	})
}