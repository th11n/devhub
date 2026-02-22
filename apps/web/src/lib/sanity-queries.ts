export const CATEGORIES_QUERY = `*[
  _type == "resourceCategory"
  && defined(slug.current)
]|order(name asc){_id, name, "slug": slug.current}`;

export const RESOURCES_QUERY = `*[
  _type == "resource"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, name, "slug": slug.current, description, link, previewImage, categories[]->{name}, logo, publishedAt}`;

export const USER_LIKES_QUERY = `*[
  _type == "likes"
  && userId == $userId
]{resourceId}`;

export const RESOURCES_BY_IDS_QUERY = `*[
  _type == "resource"
  && _id in $ids
]{_id, name, "slug": slug.current, description, link, previewImage, categories[]->{name}, logo, publishedAt}`;

export const SEARCH_RESOURCES_QUERY = `*[
  _type == "resource"
  && (name match $query || description match $query)
]|order(publishedAt desc){_id, name, "slug": slug.current, description, link, previewImage, categories[]->{name}, logo, publishedAt}`;

export const CATEGORY_RESOURCES_QUERY = `*[
  _type == "resource"
  && references(*[_type == "resourceCategory" && slug.current == $slug]._id)
]|order(publishedAt desc){_id, name, "slug": slug.current, description, link, previewImage, categories[]->{name}, logo, publishedAt}`;
