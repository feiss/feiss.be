
# //prepare header & footer
# $header = file_get_contents("pages/header.tpl")
# $header = str_replace("href=\"/$section\"", "href=\"/$section\" class="on"", $header)
# $header = str_replace("*title*", ucwords($section), $header)
# $footer = file_get_contents("pages/footer.tpl")

# //static page(special project, blog post..)
# if ($section != "blog" & & file_exists("pages/$section/$subsection.html"))
# {
# $tmp = file_get_contents("pages/$section/$subsection.html")
#  $tmp = str_replace("*share_icons*", "<a href="javascript:;" onclick="share(\"f\",\"http://feiss.be/".$section."#".$subsection."\")" class="fb"></a>&nbsp;<a href="javascript:;" title="Share on Google+" onclick="share(\"g\",\"http://feiss.be/".$section."#".$subsection."\")" class="gp"></a>&nbsp;<a href="javascript:;" onclick="share(\"t\",\"http://feiss.be/".$section."/".$subsection."\")" class="twt"></a>", $tmp)
#  $item = substr($section == "misc"?"projects": $section, 0, -1)
#  $tmp. = "\n<p><a href="/$section" class="moreinfobig">&larr; Return to $item list</a></p>"
#  echo $header."<div>".$tmp."</div>".$footer
#  }

from pathlib import Path
import datetime
date = datetime.date.today()
year = date.strftime("%Y")


def header_footer(section):
    header = Path("pages/header.tpl.html").read_text()
    header = header.replace("*title*", section.title())
    header = header.replace("*ROOT*", ".")

    footer = Path("pages/footer.tpl.html").read_text()
    footer = footer.replace("*year*", year)
    return (header, footer)


def generate(tplfile, outfile, section):
    (header, footer) = header_footer(section)
    tpl = Path(tplfile).read_text()
    tpl = tpl.replace("*ROOT*", ".")
    file = open(outfile, "w")
    file.write(header)
    file.write(tpl)
    file.write(footer)
    file.close()


def generate_section(section):
    (header, footer) = header_footer(section)

    file = open(section+".html", "w")
    file.write(header)

    projects = Path("pages/"+section+"/order").read_text().split("\n")
    for project in projects:
        if project[0] == "*":
            continue
        tpl = Path("pages/"+section+"/"+project+".html").read_text()
        tpl = tpl.replace("*share_icons*", "")
        tpl = tpl.replace("*ROOT*", ".")
        file.write(tpl)

    file.write(footer)
    file.close()


generate("pages/404.tpl.html", "404.html", "404")
generate_section("movies")
generate_section("games")
generate_section("misc")
generate_section("aboutme")
