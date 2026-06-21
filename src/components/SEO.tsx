import { Helmet } from "react-helmet-async";

const BASE_URL = "https://www.boxifly.pe";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "product";
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

/**
 * Per-route SEO head tags. Renders unique title, meta description,
 * canonical link, and Open Graph metadata that self-references
 * the current route URL.
 */
export const SEO = ({
  title,
  description,
  path,
  ogType = "website",
  image,
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const url = `${BASE_URL}${path}`;
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncatedDesc =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      <meta name="description" content={truncatedDesc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      {image && <meta name="twitter:image" content={image} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
