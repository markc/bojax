###### 27 January 2014 on GitHub

# BoJAX

_A very simple static blog system based on **Bootstrap and AJAX** using an
optional Git (or [GitHub]) backend to manage a website._

The primary goal of this project is to provide...

- a basic Bootstrap **mobile-first** interface
- an AJAX/pushState driven `single page application`
- short numeric bookmarkable URLs for posts by default
- modern HTML5/CSS3 attributes (no IE6/7/8/9 support)
- will run on as little as a 64Mb VPS or LXC container
- no PHP or server side language or database required
- optional integration with [OpenResty] and [LUA] scripts


## Installation

To install just [clone this repo] or [download and extract] the zipfile and
point your web server to it's directory, zero setup. A build script for
[OpenResty], using the latest nginx and [LUA] module, is available from the
[markc/lua] repository as [openresty.build].

    # on webserver
    cd /var/www
    git clone https://github.com/markc/bojax bojax.net

A simple configuration snippet for `nginx` could be something like this,
using **bojax.net** as an example domainname...

    server {
      port              80; # or 8080 for testing
      server_name       bojax.net; # or localhost for testing
      root              /var/www/bojax.net;
      location          / { try_files $uri $uri/ /index.html; }
    }


The location try_files line forces all the non-existent urls back to
`index.html` so they can be resolved by the [lib/js/bojax.js] jQuery plugin
and provide bookmarking of these virtual URLs. The reason for the short
numeric URLs is so they are indeed short and easy to paste into emails or
other blogs posts instead of using some 3rd party short-URL service.
Non-numeric URLs are reserved for non-Markdown based LUA links. A more
complete `nginx.conf` example is available as [openresty.conf].


## Auto Update Remote Site

If using Github then it's [post-receive-hooks] feature can be used to auto
update a website, but then some kind of PHP or server side scripting is
required, so to keep it ultra simple, `rsync` called from a local Git repo
as a `.git/hooks/post-commit` hook can be used instead...

    #!/bin/sh
    rsync -av ./ bojax.net:var/www/bojax.net --del --exclude='.git'
    ssh -t bojax.net 'bash +m -ic nrestart'

where `nrestart` is a shell alias on the remote server...

    alias nstart='sudo /home/admin/bin/nginx'
    alias nstop='sudo kill `cat /home/admin/tmp/nginx.pid`'
    alias nrestart='nstop;nstart'

Make sure you `chmod +x .git/hooks/post-commit` and the `./` rsync source
path will need to be a full path to your repo if you execute a
`git commit/push` from outside of your git repo. `bojax.net:` assumes your
SSH keys are setup for the remote server and your `~/.ssh/config` is
configured appropriately (again, change `bojax.net` to your domainname)...

    Host bojax.net
      User admin
      Port 2222
      Hostname 12.34.56.78
      IdentityFile ~/.ssh/bojax.net.key


## How To Create A New Post

A new post is created by adding a new [Markdown] file to `lib/md/` with a
very simple format. The very first line has to be a `######` (H6) tag
with a friendly date and category which is followed by a blank line and
`#` (H1) heading, for example...

    ###### 1 January 2014 on Personal Blog

    # [Happy New Year]

This is followed, after another blank line, by the content of the post in
Markdown format. Name the file `digit.md` where `digit` is the next higher
number in the `lib/md/` folder and link to it as `slash + digit` (ie; /10).

For now the initial frontpage index has to be created by hand so copy the
top 2 `######` and `#` headings and the **first paragraph** and paste them
into the top of the [lib/md/1.md] file (the main index page) followed by a
link to the actual `lib/md/*.md` posting. Use a `---` (HR) line separator
between the frontpage summaries. Here is a full frontpage summary example...

    ###### 1 January 2014 on Personal Blog

    # [Happy New Year]

    Hello everyone, I hope you have a very happy year ahead! :-)

    [Happy New Year]: /10

    ---

So clicking on the "Happy New Year" heading will load in the contents of
`lib/md/10.md` posting. Then clicking on the site title again will go back
to the `lib/md/1.md` frontpage index summary, which is particularly handy
on a mobile touch device.

Something like this shell snippet below can work out the filename of the
next posting when executed from the root of the repo...

    echo "lib/md/$(($(/bin/ls -1v lib/md | tail -n 1 | cut -d. -f 1)+1)).md"

Obviously feel free to remove or edit the current examples in `lib/md` as
they are there simply to provide some blog-like example context, however,
the special [lib/md/1.md] frontpage must remain as the main index.


## How To Handle Images

Image handling is a bit of a hack but the first attempt seems to mostly work
by abusing the [marked] script and its [GFM] extension for tables. Using the
example from the [/10] post, the first row (with FullSize) defines the image
itself wrapped inside a link, the 2nd row says to center this table column
and the 3rd row is a comment in italics. The `[2]` becomes the `src` of the
image and `[1]` becomes a direct link to the image so it can be viewed in
it's original form and downloaded via the RMB browser menu.

    # [ownCloud Is Too Heavy]

    |[![FullSize][2]][1]|
    |:---:|
    | _ownCloud Android app config screen_ |

    (posting content)

    [1]: http://u2.renta.net/lib/img/n5-owncloud.jpg
    [2]: /lib/img/n5-owncloud.jpg

The above is for the actual posting page, for the summary in the index page
we want a thumbnail that also links to the actual post. For this we use the
below construct where the image and it's link are above the main heading and
the `n5-owncloud` reference links to the actual image (which could be offsite).

    [![Thumbnail][n5-owncloud]][10]

    # [ownCloud Is Too Heavy]

    (posting content)

    [n5-owncloud]: /lib/img/n5-owncloud.jpg
    [10]: /10

Without a fancy dynamic backend this is a bit of a bother and definitely a
kludge but, it works, and yet again saves us from requiring that backend
which has to be paid for with extra server resources.


## [index.html]

Some titles and links need to be changed in the [index.html] page and comment
or remove the [OpenResty Lua Examples] if they are of no interest. The main
frontpage index links to [lib/md/1.md] from the `navbar-brand` project
title and must remain as such. `About` links to [lib/md/2.md] which in turn
symlinks to this [README.md]. `Contact` links  to [lib/md/3.md] and is
generic enough to remain as is. `Comments` links to [lib/md/4.md] and needs
to be altered to your [disqus] account if you chose to use such a "Comments"
page. The Bootstrap and jQuery CDN links will always be updated to the latest
stable releases. You could always try an older jQuery if you need IE support.


## [lib/js/bojax.js]

The important core part of this project is [lib/js/bojax.js] which provides
the AJAX and HTML5 pushState functionality at (currently) about 100 lines
of code. It's based on [jquery-boilerplate] with a few clues borrowed from
[jquery.ajaxable], thanks @matheusgomesweb. Ideas and patches to improve
this jQuery plugin are most welcome.


## [lib/css/style.css]

The main [lib/css/style.css] stylesheet is a mixture of some markup style
from the [Ghost] project plus a little [Github] styling on top of a
[Bootstrap] foundation. Adjust to your tastes.


[post-receive-hooks]: https://help.github.com/articles/post-receive-hooks
[Markdown]: http://en.wikipedia.org/wiki/Markdown
[jquery-boilerplate]: https://github.com/jquery-boilerplate
[jquery.ajaxable]: https://github.com/matheusgomesweb/jquery.ajaxable
[clone this repo]: https://github.com/markc/bojax
[download and extract]: https://github.com/markc/bojax/archive/master.zip
[disqus]: http://disqus.com/websites
[OpenResty Lua Examples]: https://github.com/markc/lua
[Github]: https://github.com
[Bootstrap]: http://getbootstrap.com
[index.html]: https://raw2.github.com/markc/bojax/master/index.html
[lib/css/style.css]: https://raw2.github.com/markc/bojax/master/lib/css/style.css
[lib/js/bojax.js]: https://raw2.github.com/markc/bojax/master/lib/js/bojax.js
[README.md]: https://raw2.github.com/markc/bojax/master/README.md
[lib/md/1.md]: https://raw2.github.com/markc/bojax/master/lib/md/1.md
[lib/md/2.md]: https://raw2.github.com/markc/bojax/master/lib/md/2.md
[lib/md/3.md]: https://raw2.github.com/markc/bojax/master/lib/md/3.md
[lib/md/4.md]: https://raw2.github.com/markc/bojax/master/lib/md/4.md
[/10]: https://raw2.github.com/markc/bojax/master/lib/md/10.md
[marked]: https://github.com/chjj/marked
[GFM]: https://help.github.com/articles/github-flavored-markdown
[OpenResty]: http://openresty.org
[LUA]: http://www.lua.org/about.html
[openresty.conf]: https://raw2.github.com/markc/lua/master/openresty.conf
[openresty.build]: https://raw2.github.com/markc/lua/master/openresty.build
[markc/lua]: https://github.com/markc/lua
[Ghost]: https://ghost.org
