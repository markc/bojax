###### 27 January 2014 on GitHub

# BoJAX

_A very simple static blog system based on **Bootstrap and AJAX** using an
optional Git (or [GitHub]) backend to manage a website._

The primary goal of this project is to provide...

- firstly, a basic Bootstrap **mobile-first** interface
- an AJAX/pushState driven `single page application`
- short numeric bookmarkable URLs for posts by default
- modern HTML5/CSS3 attributes (no IE6/7/8/9 support)
- will run on as little as a 64Mb VPS or LXC container
- no PHP or server side scripting or database required


## Installation

To install just [clone this repo] or [download and extract] the zipfile and
point your web server to it's directory, zero setup. A build script for
[OpenResty], using the latest nginx and [LUA] module, is available from the
[markc/lua] repository as [openresty.build].

    # on webserver
    cd /var/www
    git clone https://github.com/markc/bojax bojax.net

If you want to also try the Lua scripts then...

    cd lib
    git clone https://github.com/markc/lua

otherwise comment out or remove the "Testing Lua" menu option in index.html...

    <!-- comment out this section if lib/lua example does not exist -->
    (remove everything between the above and below comments markers)
    <!-- end lib/lua comment section -->

You will also want to update the `/3` Contact form and add your email address
in the Javascript section at the bottom and also remove the `/4` Comments link
or go to [disqus.com] and set up your own comments thread.

    <!-- <li><a href="/4"><i class="fa fa-comment"></i> Comments</a></li> -->

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
    ssh -t -t bojax.net '/home/admin/bin/nrestart'
    echo
    echo "Remember to 'git push' if using a remote git repo"

where `nrestart` is a shell script on the remote server...

    #!/bin/sh
    sudo kill `cat /home/admin/tmp/nginx.pid` && sudo /home/admin/bin/nginx

and these aliases are also handy for the admin user (assuming OpenResty
has been built and installed under the admin user account)...

    alias nstart='sudo /home/admin/bin/nginx'
    alias nstop='sudo kill `cat /home/admin/tmp/nginx.pid`'

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

    # [Double Rainbow]

This is followed, after another blank line, by the content of the post in
Markdown format. Name the file `digit.md` where `digit` is the next higher
number in the `lib/md/` folder and link to it as `slash + digit` (ie; /5).

For now the initial frontpage index has to be created by hand so copy the
top 2 `######` and `#` headings and the **first paragraph** and paste them
into the top of the [lib/md/1.md] file (the main index page) followed by a
link to the actual `lib/md/*.md` posting. Use a `---` (HR) line separator
between the frontpage summaries. Here is a full frontpage summary example...

    ###### 1 January 2014 on Personal Blog

    # [Double Rainbow]

    (posting summary)

    [Double Rainbow]: /5

    ---

So clicking on the "Double Rainbow" heading will load in the contents of the
`lib/md/5.md` posting. Then, when viewing the actual posting, clicking on
the site title again will go back to the `lib/md/1.md` frontpage index
summary which is particularly handy on a mobile touch device.

Something like this shell snippet below can work out the filename of the next
posting when executed from the root of the repo...

    echo "lib/md/$(($(/bin/ls -1v lib/md | tail -n 1 | cut -d. -f 1)+1)).md"

Obviously feel free to remove or edit the current examples in `lib/md` as
they are there simply to provide some blog-like example context, however,
the special [lib/md/1.md] frontpage must remain as the main index.


## How To Handle Images

Image handling is a bit of a hack but the first attempt seems to mostly work
by abusing the [marked] script and its [GFM] extension for tables. Using the
example from the [/5] post, the first row (with halfsize) defines the image
itself wrapped inside a link, the 2nd row says to center this table column
and the 3rd row is a comment in italics. The `[2]` becomes the `src` of the
image and `[1]` becomes a direct link to the image so it can be viewed in
it's original form and downloaded via the RMB browser menu.

    # [Double Rainbow]

    |[![halfsize][1]][2]|
    |:---:|
    | _Double Rainbow from Moana Park, QLD, AU_ |

    (posting content)

    [Double Rainbow]: /1
    [1]: http://markconstable.com/lib/img/20131214_Double_Rainbow_halfsize.jpg
    [2]: http://markconstable.com/lib/img/20131214_Double_Rainbow.jpg

The above is for the actual posting page, for the summary in the index page
we want a thumbnail that also links to the actual post. For this we use the
below construct where the image and it's link are above the main heading and
the `double_rainbow` reference links to the actual image, which could be
offsite so they are still visible, for instance, in a Github repo.

    ###### 1 January 2014 on Personal Blog

    [![thumbnail][double_rainbow]][5]

    # [Double Rainbow]

    (posting content)

    [Double Rainbow]: /5
    [double_rainbow]: http://markconstable.com/lib/img/20131214_Double_Rainbow_thumbnail.jpg
    [5]: /5

Without a fancy dynamic backend this is a bit of a bother and definitely a
kludge but, it works, and saves us from requiring backend server side scripts
(like PHP) to do the heavy lifting.

You have to manually create thumbnail and halfsize images if you care about
the download size on the front and posting pages. Use a max-width of 192px
for thumbnails and max-width of 640px or max-height of 360px (which ever is
less) for the halfsize images to be consistant. An example listing of the
images from the [/5] posting is...

    -rw-r--r-- 1 admin daemon 2147488 Dec 14 03:10 20131214_Double_Rainbow.jpg
    -rw-r--r-- 1 admin daemon   20191 Feb  7 13:47 20131214_Double_Rainbow_halfsize.jpg
    -rw-r--r-- 1 admin daemon    8957 Feb  7 13:47 20131214_Double_Rainbow_thumbnail.jpg


## [bojax.html]

Some titles and links need to be changed in the [index.html] page. The main
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


## [lib/css/bojax.css]

The main [lib/css/bojax.css] stylesheet is a mixture of some markup style
from the [Ghost] project plus a little [Github] styling on top of a
[Bootstrap] foundation. Adjust to your tastes.


[post-receive-hooks]: https://help.github.com/articles/post-receive-hooks
[Markdown]: http://en.wikipedia.org/wiki/Markdown
[jquery-boilerplate]: https://github.com/jquery-boilerplate
[jquery.ajaxable]: https://github.com/matheusgomesweb/jquery.ajaxable
[clone this repo]: https://github.com/markc/bojax
[download and extract]: https://github.com/markc/bojax/archive/master.zip
[disqus]: http://disqus.com/websites
[Github]: https://github.com
[Bootstrap]: http://getbootstrap.com
[index.html]: https://raw2.github.com/markc/bojax/master/index.html
[lib/css/bojax.css]: https://raw2.github.com/markc/bojax/master/lib/css/bojax.css
[lib/js/bojax.js]: https://raw2.github.com/markc/bojax/master/lib/js/bojax.js
[README.md]: https://raw2.github.com/markc/bojax/master/README.md
[lib/md/1.md]: https://raw2.github.com/markc/bojax/master/lib/md/1.md
[lib/md/2.md]: https://raw2.github.com/markc/bojax/master/lib/md/2.md
[lib/md/3.md]: https://raw2.github.com/markc/bojax/master/lib/md/3.md
[lib/md/4.md]: https://raw2.github.com/markc/bojax/master/lib/md/4.md
[/5]: https://raw2.github.com/markc/bojax/master/lib/md/5.md
[marked]: https://github.com/chjj/marked
[GFM]: https://help.github.com/articles/github-flavored-markdown
[Ghost]: https://ghost.org
[disqus.com]: http:disqus.com

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/markc/bojax/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

