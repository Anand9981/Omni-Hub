import { getChannel } from '../../utils/constants.js';

/**
 * Colour-coded channel tag. Colours match PRD 12.2 so a platform reads the
 * same in the inbox and in the analytics charts.
 */
export default function ChannelBadge({ platform, size = 'md', withLabel = true }) {
  const channel = getChannel(platform);
  return (
    <span
      className={`channel-badge channel-badge--${size}`}
      style={{ '--channel-color': channel.color, '--channel-tint': channel.tint }}
      title={channel.label}
    >
      <span className="channel-badge-mark">{channel.short}</span>
      {withLabel && <span className="channel-badge-label">{channel.label}</span>}
    </span>
  );
}