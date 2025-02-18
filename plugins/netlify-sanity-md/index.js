import {createClient} from "@sanity/client";
import fs from "fs-extra";
import toMarkdown from "@sanity/block-content-to-markdown";
export async function onPreBuild({ utils, packageJson }) {
  console.log("Starting plugin");
  //imports
  // const toMarkdown = require("@sanity/block-content-to-markdown");
  const client = createClient({
    projectId: "llueunw5",
    dataset: "production",
    useCdn: false,
  });

  //add any serializers for your portable text
  const serializers = {
    types: {
      code: (props) => "```" + props.node.language + "\n" + props.node.code + "\n```",
    },
  };

  /*fs.readdir("./content", (err, files) => {
    if (err) console.log(err);
    else {
      files.forEach((file) => {
        console.log(`Deleting: ${file}`);
        fs.unlink(`content//${file}`, (err) => {
          if (err) throw err;

        });
      });
    }
  });
  */
  try {
    console.log("Fetching data from Sanity");
    await client
      .fetch(`*[_type == "news"]{categories[]->{title}, date, slug, title, body}`)
      .then((res) => res.map(async (post) => {
        
        //output YAML frontmatter here
        let frontmatter = "---";
        console.log(post);
        Object.keys(post).forEach((field) => {
          if (field === "slug") {
            return (frontmatter += `\n${field}: "${post.slug}"`);
          } else if (field === "categories") {
            return (frontmatter += `\n${field}: [${post.categories.map(
              (cat) => `"${cat.title}"`
            )}]`);
          } else if (field === "body") {
            return;
          } else {
            frontmatter += `\n${field}: "${post[field]}"`;
          }
        });
        frontmatter += "\n---\n\n";
        
        const wholePost = `${frontmatter}${toMarkdown(post.body, {
          serializers,
        })}`;

        const filePath = `./content/blog/${post.slug}.md`;
        await fs.outputFile(filePath, wholePost, function (err, data) {
          if (err) {
            return console.log(err);
          }
        });
      })
      );
  } catch (error) {
    utils.build.failBuild("Failure message", { error });
  }
}