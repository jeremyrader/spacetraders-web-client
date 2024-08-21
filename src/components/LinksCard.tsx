'use client'

interface LinksCardProps {
  links: {
    name: string;
    url: string;
  }[]
}

const LinksCard = ({links}: LinksCardProps) => {
  return (
    <div className="card h-auto shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Links</h2>
        {
          links.length > 0 ? (
            links.map((link, index) => (
              <div key={index}>
                <a className="link link-primary" href={link.url}>{link.name}</a>
              </div>
            ))
          ) : (
            <span>No links listed</span>
          )
        }
      </div>
    </div>
  )
}

export default LinksCard