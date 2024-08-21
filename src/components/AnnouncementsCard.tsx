'use client';

interface AnnouncementsCardProps {
  announcements: {
    title: string;
    body: string;
  }[];
}

const AnnouncementsCard = ({ announcements }: AnnouncementsCardProps) => {
  return (
    <div className="card shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Announcements</h2>
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <div key={index}>
              <p>{announcement.title}</p>
              <p>{announcement.body}</p>
            </div>
          ))
        ) : (
          <span>No new announcements</span>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsCard;
