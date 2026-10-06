import type { Media } from '../data/works'

export default function MediaPlate({
  media,
  alt,
  caption,
  fit = 'cover',
}: {
  media: Media
  alt: string
  caption?: string
  fit?: 'cover' | 'contain'
}) {
  return (
    <figure className="plate plate-corners">
      <div className="plate-media" data-fit={fit}>
        <img src={media.src} alt={alt} loading="lazy" decoding="async" />
      </div>
      {caption ? (
        <figcaption className="plate-caption">
          <span>{caption}</span>
          <span className="cap-id" aria-hidden="true">
            ▚
          </span>
        </figcaption>
      ) : null}
      <span className="corner" aria-hidden="true" />
    </figure>
  )
}
