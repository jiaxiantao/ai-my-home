type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Structured data is intentionally serialized server-side for SEO.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
