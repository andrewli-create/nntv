const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              tags
              templateKey
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const posts = result.data.allMarkdownRemark.edges
    // const modules = result.data.allMarkdownRemark.edges.node[0].frontmatter.modules
    console.log("Unique Test", result.data.allMarkdownRemark.edges);
    var pageSkipped = 0;
    posts.forEach((edge) => {
      const id = edge.node.id
      // console.log("Unique Module", edge.node.frontmatter.modules);
      
      if (edge.node.frontmatter.templateKey != null && edge.node.frontmatter.templateKey != "" && edge.node.frontmatter.templateKey != " ") {
        createPage({
          path: edge.node.fields.slug,
          tags: edge.node.frontmatter.tags,
          component: path.resolve(
            `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
          ),
          // additional data can be passed via context
          context: {
            id,
          },
        })
      } else {
        pageSkipped++;
      }
      // if (edge.node.frontmatter.modules != null) {
      //   edge.node.frontmatter.modules.forEach((module) => {
      //     var modulePath = module.modulestitle.replace(/ /g,"-");
      //     createPage({
      //       path: modulePath,
      //       component: path.resolve(
      //         `src/templates/module-page.js`
      //       ),
      //       // additional data can be passed via context
      //       context: {
      //         id,
      //         house: `Gryffindor`,
      //         modulestitle: module.modulestitle,
      //       },
      //     })
      //   })
      // }
      
    })

    console.log(pageSkipped + " pages were omitted.");

    // Tag pages:
    let tags = []
    // Iterate through each post, putting all found tags into `tags`
    posts.forEach((edge) => {
      if (_.get(edge, `node.frontmatter.tags`)) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }
    })
    // Eliminate duplicate tags
    tags = _.uniq(tags)

    // Make tag pages
    tags.forEach((tag) => {
      const tagPath = `/tags/${_.kebabCase(tag)}/`

      createPage({
        path: tagPath,
        component: path.resolve(`src/templates/tags.js`),
        context: {
          tag,
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
