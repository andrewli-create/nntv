if (typeof window !== 'undefined') {

    // add admin.css
    const link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = '/admin/admin.css'
    document.head.appendChild(link)

    // add admin.js
    // const jsLink = document.createElement('script')
    // jsLink.type = 'script'
    // jsLink.rel = 'script'
    // jsLink.href = '/admin/admin.js'
    // document.head.appendChild(jsLink)

    // add jquery.js
    var jqueryScript = document.createElement('script');
    jqueryScript.type = 'text/javascript';
    jqueryScript.src = '/admin/jquery-3.7.1.min.js';
    document.head.appendChild(jqueryScript);

    // add admin.js
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/admin/admin.js';
    document.head.appendChild(script);

    

    

    if (process.env.NETLIFY_SITE_URL) {
        window.localStorage.setItem(
            'netlifySiteURL', process.env.NETLIFY_SITE_URL
        )
    }

    // Log netlifySiteURL if editing on localhost
    if (
        window.location.hostname === 'localhost' &&
        window.localStorage.getItem('netlifySiteURL')
    ) { 
        console.log(
            `%cnetlifySiteURL: ${window.localStorage.getItem('netlifySiteURL')}`,
            'color: hotpink; font-size: 15px'
        )
    }
}