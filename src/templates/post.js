import React from "react"
import { graphql, Link } from "gatsby"

import { usePlugin } from "tinacms"
import { useRemarkForm, DeleteAction } from "gatsby-tinacms-remark"
import { InlineForm, InlineTextField } from "react-tinacms-inline"
import { InlineWysiwyg } from "react-tinacms-editor"

import {
  Paper,
  Meta,
  MetaSpan,
  MetaActions,
  DraftBadge,
} from "../components/style"
import { EditToggle } from "../components/editToggle"
import { ListAuthors } from "../components/authors"
import { ListTags } from "../components/tags"
import { PageLayout } from "../components/pageLayout"
import { useAuthors } from "../components/useAuthors"
import { useTags } from "../components/useTags"

function Post(props) {
  const authors = useAuthors()
  const tags = useTags()
  const page = props.data.markdownRemark

  const formOptions = {
    actions: [DeleteAction],
    fields: [
      {
        label: "Title",
        name: "rawFrontmatter.title",
        component: "text",
      },
      {
        label: "Authors",
        name: "rawFrontmatter.authors",
        component: "authors",
        authors: authors,
      },
      {
        name: "rawFrontmatter.draft",
        component: "toggle",
        label: "Draft",
      },
      {
        label: "Hero Image",
        name: "rawFrontmatter.hero.image",
        component: "image",
        parse: (media) => {
          if (!media) return ""
          return `../images/${media.filename}`
        },
        uploadDir: () => `/content/images/`,
        previewSrc: (src, path, formValues) => {
          if (
            !formValues.frontmatter.hero ||
            !formValues.frontmatter.hero.image
          )
            return ""
          return formValues.frontmatter.hero.image.childImageSharp.fluid.src
        },
      },
      {
        label: "Tags",
        name: "rawFrontmatter.tags",
        component: "tags",
        tags: tags,
      },
    ],
  }

  const [data, form] = useRemarkForm(page, formOptions)
  usePlugin(form)

  return (
    <InlineForm form={form}>
      <PageLayout page={data}>
        <Paper>
          <Meta>
            <MetaSpan>{data.frontmatter.date}</MetaSpan>
            {data.frontmatter.authors && data.frontmatter.authors.length > 0 && (
              <MetaSpan>
                <em>By</em>&nbsp;
                <ListAuthors authorIDs={data.frontmatter.authors} />
              </MetaSpan>
            )}
            <MetaActions>
              <Link to="/blog">← Back to Blog</Link>
            </MetaActions>
          </Meta>
          <h1>
            <InlineTextField name="rawFrontmatter.title" />
          </h1>
          <hr />
          <InlineWysiwyg name="rawMarkdownBody" format="markdown">
            <div
              dangerouslySetInnerHTML={{
                __html: data.html,
              }}
            />
          </InlineWysiwyg>
          {data.frontmatter.draft && <DraftBadge>Draft</DraftBadge>}
          {process.env.NODE_ENV !== "production" && <EditToggle />}
        </Paper>
        {data.frontmatter.tags && data.frontmatter.tags.length > 0 && (
          <Meta>
            <MetaSpan>
              <ListTags tagIDs={data.frontmatter.tags} />
            </MetaSpan>
          </Meta>
        )}
      </PageLayout>
    </InlineForm>
  )
}

export default Post

export const postQuery = graphql`
  query($path: String!) {
    markdownRemark(
      published: { eq: true }
      frontmatter: { path: { eq: $path } }
    ) {
      id
      excerpt(pruneLength: 160)
      html

      frontmatter {
        path
        date(formatString: "MMMM DD, YYYY")
        title
        draft
        authors
        hero {
          large
          overlay
          image {
            childImageSharp {
              fluid(quality: 70, maxWidth: 1920) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
        tags
      }

      fileRelativePath
      rawFrontmatter
      rawMarkdownBody
    }
    authors: settingsJson(fileRelativePath: { eq: "/content/settings/authors.json" }) {
      ...authors
    }
    tags: settingsJson(fileRelativePath: { eq: "/content/settings/tags.json" }) {
      ...tags
    }
  }
`
