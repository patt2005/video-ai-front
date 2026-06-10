import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { ContentType } from '../../types/generation/content';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { VideoResultModal } from '../../components/modals/videoResultModal';
import '../../styles/publicProfile.css';

const BASE_URL = 'https://video-ai-front-production.up.railway.app';

interface PublicUser {
  id: string;
  userName: string;
  userAvatar: string | null;
}

interface ContentItem {
  id: string;
  contentType: ContentType;
  url: string | null;
  prompt: string | null;
  model: string | null;
}

interface TaskItem {
  id: string;
  creationDate: string;
  status: string;
  content: ContentItem | null;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ type: ContentType; url: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      axios.get<PublicUser>(`${BASE_URL}/api/User/${userId}/public`),
      axios.get<TaskItem[]>(`${BASE_URL}/api/Task/user/${userId}`, { headers: authHeaders() }),
    ])
      .then(([userRes, tasksRes]) => {
        setProfileUser(userRes.data);
        setTasks(tasksRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const completedContent = tasks
    .filter((t) => t.status === 'Success' && t.content?.url)
    .map((t) => t.content!);

  const filtered = activeTab === 'all'
    ? completedContent
    : completedContent.filter((c) => c.contentType.toLowerCase() === activeTab);

  if (loading) {
    return (
      <div className="pub-profile-loading">
        <Icon icon="mdi:loading" width={36} className="pub-profile-spinner" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="pub-profile-not-found">
        <Icon icon="mdi:account-off" width={48} />
        <p>User not found</p>
      </div>
    );
  }

  const tabs = [
    { key: 'all' as const, label: 'All', icon: 'mdi:grid' },
    { key: 'image' as const, label: 'Images', icon: 'mdi:image' },
    { key: 'video' as const, label: 'Videos', icon: 'mdi:video' },
  ];

  return (
    <div className="pub-profile">

      {/* Hero gradient banner */}
      <div className="pub-profile-hero" />

      {/* Avatar + name */}
      <div className="pub-profile-identity">
        <div className="pub-profile-avatar-row">
          <div className="pub-profile-avatar">
            {profileUser.userAvatar ? (
              <img src={profileUser.userAvatar} alt={profileUser.userName} className="pub-profile-avatar-img" />
            ) : (
              <Icon icon="mdi:account" width={48} className="pub-profile-avatar-icon" />
            )}
          </div>
          <div className="pub-profile-meta">
            <h1 className="pub-profile-name">{profileUser.userName}</h1>
            <p className="pub-profile-stats">
              {completedContent.length} creation{completedContent.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + grid */}
      <div className="pub-profile-body">
        <div className="pub-profile-tabs">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`pub-profile-tab${activeTab === key ? ' pub-profile-tab--active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon icon={icon} width={15} />
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="pub-profile-empty">
            <Icon icon="mdi:image-off-outline" width={40} />
            <p>No {activeTab === 'all' ? 'content' : activeTab + 's'} yet</p>
          </div>
        ) : (
          <div className="pub-profile-grid">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="pub-profile-grid-item"
                onClick={() => setPreview({ type: c.contentType, url: c.url! })}
              >
                {c.contentType === ContentType.Image ? (
                  <img src={c.url!} alt={c.prompt ?? ''} className="pub-profile-media" />
                ) : (
                  <video src={c.url!} className="pub-profile-media" muted playsInline />
                )}
                <div className="pub-profile-grid-overlay">
                  <Icon
                    icon={c.contentType === ContentType.Image ? 'mdi:image' : 'mdi:play-circle'}
                    width={20}
                    className="pub-profile-grid-type-icon"
                  />
                  {c.prompt && <p className="pub-profile-grid-prompt">{c.prompt}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ImageResultModal
        open={preview?.type === ContentType.Image}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
        imageSrc={preview?.type === ContentType.Image ? preview.url : null}
      />
      <VideoResultModal
        open={preview?.type === ContentType.Video}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
        videoUrl={preview?.type === ContentType.Video ? preview.url : null}
      />
    </div>
  );
}
