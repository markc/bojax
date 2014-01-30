###### 27 January 2014 on GitHub

# Bjax

A very simple static blog system based on Bootstrap + AJAX using an optional
Git(hub) backend to manage a website, which can also act as a backup. The
primary goals of this project are to provide...

- a basic Bootstrap mobile-first interface
- a totally AJAX/pushState driven `single page application`
- modern HTML5/CSS3 attributes (no IE6/7/8/9 support)
- some layout ideas and CSS courtesy of [Ghost]
- short numeric URLs by default
- no PHP or server side language or database required
- will run on as little as a 64Mb VPS or LXC container
- optional integration with OpenResty and LUA scripts

To install just [clone this repo] or [download and extract] the zipfile and
point your web server to it's directory, zero setup.

    # on webserver
    cd /var/www
    git clone https://github.com/markc/bjax

A simple configuration snippet for `nginx` could be something like this...

    server {
      server_name  bjax.example.com;
      root         /var/www/bjax/;
      location     / { try_files $uri $uri/ /index.html; }
    }

which would force all the non-existent numeric short-urls back to the
index.html file and provide deep linking. If using Github then it's
[post-receive-hooks] feature can be used to auto update a website but
then some kind of PHP or server side scripting is required so to keep it
ultra simple `rsync` called from a local `.git/hooks/post-commit` hook
can be used instead.

    #!/bin/sh
    rsync -aq ./ remote_site:/var/www/bjax --del --exclude='.git'
    ssh -t remote_site sudo -i nginx -s reload

Make sure you `chmod +x .git/hooks/post-commit` and the `./` path will
need to be a full path to your repo if you execute a `git commit/push`
from outside of your git repo. `remote_site:` assumes your SSH keys are
setup for the remote server and your `~/.ssh/config` is configured
appropriately...

    Host remote_site
      User admin
      Port 2222
      Hostname 12.34.45.67
      IdentityFile ~/.ssh/remote_site_key


## How to Create a New Post

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
`lib/md/10.md` posting. Clicking on the site title will load back in the
`lib/md/1.md` frontpage index which is particularly handy in mobile mode.

Something like this shell snippet below can work out the filename of the
next posting when executed from the root of the repo...

    echo "lib/md/$(($(/bin/ls -1v lib/md | tail -n 1 | cut -d. -f 1)+1)).md"

Obviously feel free to remove or edit the current examples in `lib/md` as
they are there simply to provide some blog-like example context, however,
the special [lib/md/1.md] frontpage must remain as the main index.

## How to handle images

Image handling is a bit of a hack but the first attempt seems to mostly work
by abusing the [marked] script and its [GFM] extension for tables. Using the
example from the [/10] post, the first row (with FullSize) defines the image
itself wrapped inside a link, the 2 second row says to center this table
column and the 3rd row is a comment in italics. The `[2]` becomes the `src`
of the image and `[1]` becomes a direct link to the image so it can be
viewed in it's original form and downloaded via the RMB browser menu.

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


## [lib/js/bjax.js]

The important core part of this project is [lib/js/bjax.js] which provides
the AJAX and HTML5 pushState functionality at (currently) about 100 lines
of code. It's based on [jquery-boilerplate] with a few clues borrowed from
[jquery.ajaxable], thanks @matheusgomesweb. Ideas and patches to improve
this jQuery plugin are most welcome.


## [lib/css/style.css]

The main [lib/css/style.css] stylesheet is a mixture of some markup style
from the [Ghost] project plus a little [Github] styling on top of a
[Bootstrap] foundation. Adjust to your tastes.


[Ghost]: http://ghost.org
[post-receive-hooks]: https://help.github.com/articles/post-receive-hooks
[Markdown]: http://en.wikipedia.org/wiki/Markdown
[jquery-boilerplate]: https://github.com/jquery-boilerplate
[jquery.ajaxable]: https://github.com/matheusgomesweb/jquery.ajaxable
[clone this repo]: https://github.com/markc/bjax.git
[download and extract]: https://github.com/markc/bjax/archive/master.zip
[disqus]: http://disqus.com/websites
[OpenResty Lua Examples]: https://github.com/markc/lua
[Github]: https://github.commit
[Bootstrap]: http://getbootstrap.com
[index.html]: https://raw2.github.com/markc/bjax/master/index.html
[lib/css/style.css]: https://raw2.github.com/markc/bjax/master/lib/css/style.css
[lib/js/bjax.js]: https://raw2.github.com/markc/bjax/master/lib/js/bjax.js
[README.md]: https://raw2.github.com/markc/bjax/master/README.md
[lib/md/1.md]: https://raw2.github.com/markc/bjax/master/lib/md/1.md
[lib/md/2.md]: https://raw2.github.com/markc/bjax/master/lib/md/2.md
[lib/md/3.md]: https://raw2.github.com/markc/bjax/master/lib/md/3.md
[lib/md/4.md]: https://raw2.github.com/markc/bjax/master/lib/md/4.md
[/10]: https://raw2.github.com/markc/bjax/master/lib/md/10.md
[marked]: https://github.com/chjj/marked
[GFM]: https://help.github.com/articles/github-flavored-markdown
