bjax
====

A very simple static blog system based on Bootstrap3 using a Git(hub)
backend to manage a website and also act as a backup. The primary goals
of this project are to provide...

- a basic Bootstrap mobile-first interface
- a totally AJAX/pushState driven `single page application`
- modern HTML5/CSS3 attributes (no IE6/7/8/9 support)
- some layout ideas and CSS courtesy of [Ghost]
- short numeric URLs by default
- no PHP or server side language or database required
- will run on as little as a 64Mb VPS or LXC container

At this stage, deep linking does not work (and can't work without server
side support) and remote http links need fixing. To install just clone
this repo and point your web server to it's checked out directory, zero
setup.

    # on webserver
    cd /var/www
    git clone https://github.com/markc/bjax

A simple configuration snippet for `nginx` could be something like
this...

    server {
      server_name  bjax.example.com;
      root         /var/www/bjax/;
      location     / { try_files $uri $uri/ /index.html; }
    }

which would force all the non-existent numeric short-urls back to the
index.html file and provide deep linking. If using Github then it's
[post-receive-hooks] feature can be used to auto update a website but
then some kind of PHP or server side scripting is required so to keep
it ultra simple `rsync` called from a local `.git/hooks/post-receive`
hook can be used instead.

    TODO example .git/hooks/post-receive

## How to Create a New Post

A new post is created by simply adding a new [Markdown] file to `lib/md/`
with a very simple format. The very first line is a `######` (H6) tag
with a friendly date and category. That is followed by a blank line
and `##` (H2) heading and then the content of the post in Markdown
format. Simply name the file `digit.md` where `digit` is the next
higher number in the `lib/md/` folder and link to it as, for example,
`/10`. For now the initial frontpage index has to be created by hand
so copy the top 2 `######` and `##` lines and the first paragraph and
paste them into `lib/md/1.md` at the very top followed by a `---` (HR)
line separator.

    ###### 1 January 2014 on Personal Blog

    ## [Happy New Year]

    Hello everyone, I hope you have a very happy year ahead! :-)

    [Happy New Year]: /10

    ---


[Ghost]: http://ghost.org
[post-receive-hooks]: https://help.github.com/articles/post-receive-hooks
[Markdown]: http://en.wikipedia.org/wiki/Markdown

