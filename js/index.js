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
			DB_init(function(db)
			{
		        ui_onopen(signaling, db)
            })
        })

        // Apply signaling "interface" events and functions to transport
        Transport_Signaling_init(signaling)

        ui_setSignaling(signaling)

        signaling.emit('joiner', room);
	})
})