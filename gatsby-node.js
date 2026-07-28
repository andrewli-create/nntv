const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// ==========================================
// EXPLICIT SCHEMA DEFINITION
// ==========================================
// This forces Gatsby to recognize optional fields even if some Firestore documents don't have them yet.
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  
  const typeDefs = `
    type ProfileImage {
      url: String
      title: String
      description: String
    }

    type ProfileDegree {
      degreeName: String
    }

    type ProfileContact {
      contactType: String
      content: String
    }

    type ProfileService {
      serviceName: String
    }

    type ProfileExpertise {
      expertiseName: String
    }

    type ProfileLanguage {
      languageName: String
    }

    type ProfileSampleOfWork {
      type: String
      title: String
      link: String
    }

    type FirestoreProfiles implements Node @infer {
      displayOrder: String
      private: Boolean
      memberType: String
      profileStatus: String
      images: [ProfileImage]
      degrees: [ProfileDegree]
      contacts: [ProfileContact]
      preferredContact: ProfileContact
      services: [ProfileService]
      expertises: [ProfileExpertise]
      languages: [ProfileLanguage]
      sampleOfWorks: [ProfileSampleOfWork]
    }
  `;
  
  createTypes(typeDefs);
};

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
      allFirestoreProfiles {
        nodes {
          id
          userID
          profileName
          profileStatus
          memberType
          private
          expiryDate
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    // ==========================================
    // PART A: PROCESS ORIGINAL MARKDOWN PAGES
    // ==========================================
    const posts = result.data.allMarkdownRemark.edges
    console.log("Unique Test", result.data.allMarkdownRemark.edges);
    var pageSkipped = 0;
    posts.forEach((edge) => {
      const id = edge.node.id
      
      if (edge.node.frontmatter.templateKey != null && edge.node.frontmatter.templateKey != "" && edge.node.frontmatter.templateKey != " " && edge.node.frontmatter.templateKey !== "team-member-page" ) {
        createPage({
          path: edge.node.fields.slug,
          tags: edge.node.frontmatter.tags,
          component: path.resolve(
            `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
          ),
          context: {
            id,
          },
        })
      } else {
        pageSkipped++;
      }
    })

    console.log(pageSkipped + " pages were omitted.");

    // Tag pages:
    let tags = []
    posts.forEach((edge) => {
      if (_.get(edge, `node.frontmatter.tags`)) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }
    })
    tags = _.uniq(tags)

    tags.forEach((tag) => {
      const tagPath = `/tags/${_.kebabCase(tag)}/`

      createPage({
        path: tagPath,
        component: path.resolve(`src/templates/tags.js`),
        context: {
          tag,
        },
      })
    });

    // ==========================================
    // PART B: PROCESS NEW FIRESTORE PROFILE PAGES
    // ==========================================
    // const allProfiles = result.data.allFirestoreProfiles.nodes || [];

    // // Safely filter the Firestore records using vanilla JS conditional structures
    // const firestoreProfiles = allProfiles.filter((profile) => {
    //   const isReviewed = profile.profileStatus === "reviewed";
    //   const isVerifiedOrPermanent = ["permanent", "verified"].includes(profile.memberType);
      
    //   // Acts exactly like your intended GraphQL "or" statement
    //   return isReviewed || isVerifiedOrPermanent;
    // });

    // firestoreProfiles.forEach((profile) => {
    //   if (!profile.profileName) return; // Skip broken or unnamed draft profiles

    //   // Safely turn "Joshua Weinfeld" into "joshua-weinfeld"
    //   const slug = profile.profileName
    //     .toLowerCase()
    //     .trim()
    //     .replace(/[^a-z0-9]+/g, "-")    // Replace spaces and special characters with hyphens
    //     .replace(/(^-|-$)/g, "");       // Remove leading/trailing hyphens

    //   createPage({
    //     path: `/member-hub/${slug}`,
    //     component: path.resolve(`src/templates/network-member-page.js`), 
    //     context: {
    //       id: profile.id, 
    //     },
    //   });
    // });

    // console.log(`Successfully built ${firestoreProfiles.length} Firestore profile pages.`);

    // ==========================================
    // PART B: PROCESS NEW FIRESTORE PROFILE PAGES
    // ==========================================
    const allProfiles = result.data.allFirestoreProfiles.nodes || [];

    const firestoreProfiles = allProfiles.filter((profile) => {
      // 1. CRITICAL OVERRIDE: If profile is marked private, completely suppress the build pipeline
      if (profile.private === true) {
        return false;
      }

      // 2. EXPIRY DATE CHECK: Block build pipeline if the date has lapsed (Bypass if memberType is permanent)
      if (profile.expiryDate && profile.memberType !== "permanent") {
        // Handle both serialized Firestore object subfields {_seconds} or native date string strings
        const seconds = profile.expiryDate.seconds || profile.expiryDate._seconds;
        const expiryDateObj = seconds ? new Date(seconds * 1000) : new Date(profile.expiryDate);
        
        if (new Date() > expiryDateObj) {
          console.log(`Skipping build for ${profile.profileName || profile.id}: Profile has expired.`);
          return false;
        }
      }
      
      // 3. STATUS & TYPE VALIDATION
      const isReviewed = profile.profileStatus === "reviewed";
      const isVerifiedOrPermanent = ["permanent", "verified"].includes(profile.memberType);
      return isReviewed || isVerifiedOrPermanent;
    });

    firestoreProfiles.forEach((profile) => {
      // CRITICAL: Ensure they have a userID assigned before building a page
      if (!profile.userID) {
        console.warn(`Skipping build for document ${profile.id} because it lacks an assigned userID.`);
        return; 
      }

       const slug = profile.userID
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")    // Replace spaces and special characters with hyphens
          .replace(/(^-|-$)/g, "");       // Remove leading/trailing hyphens

      createPage({
        path: `/network-hub/${slug}`, // Clean, predefined structural paths!
        component: path.resolve(`src/templates/network-member-page.js`), 
        context: {
          id: profile.id, 
        },
      });
    });

    console.log(`Successfully built ${firestoreProfiles.length} Firestore profile pages via unique User IDs.`);
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

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;

  if (!getApps().length) {
    let serviceAccount;

    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
      } catch (e) {
        console.error("Failed to parse FIREBASE_ADMIN_CREDENTIALS env variable.");
        return;
      }
    } else {
      try {
        serviceAccount = require("./firebase-admin-key.json");
      } catch (error) {
        console.error("Missing local firebase-admin-key.json file! Sourcing skipped.");
        return;
      }
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const db = getFirestore();
  
  const snapshot = await db.collection("profiles").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const nodeMeta = {
      id: createNodeId(`firestore-profile-${doc.id}`),
      parent: null,
      children: [],
      internal: {
        type: `FirestoreProfiles`,
        content: JSON.stringify(data),
        contentDigest: createContentDigest(data),
      },
    };
    createNode({ ...data, ...nodeMeta });
  });
};