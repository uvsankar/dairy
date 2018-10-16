/*
    Need to develop a proper Single Page Application. 
    until then this is what I can come up with.
    The minimalistic UI was developed by @nithinsanjey.
    I DONT KNOW TO DESIGN WEBPAGES . 
    WEB DESIGNERS FEEL FREE TO CONTRIBUTE!!!
*/
(function () {
    let journalName = Config.dairyName;

    let baseUrl = Config.server.baseURL;

    function saveJournalEntry(journalName, title, data) {
        let payload = {
            data,
            title: title,
            createdDate: new Date().toISOString()
        }
        jQuery.post(`${baseUrl}/journal/${journalName}`, payload).done(function (result) {
            alert("saved");
            console.log("saved: " + result)
        }).fail(function (err) {
            alert("failed")
            console.error(err)
        })
    }

    $(document).keypress("s", function (e) {
        if (e.ctrlKey && e.shiftKey) {
            let title = $('h1')[0].innerText
            let data = $('main')[0].innerHTML
            saveJournalEntry(journalName, title, data);
        }

    });

    InlineEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => {
            console.error( error );
        } );
})()