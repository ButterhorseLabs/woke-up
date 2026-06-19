const PROXY_PRIMARY = 'https://api.allorigins.win/get?url=';
const PROXY_FALLBACK = 'https://corsproxy.io/?';

export async function fetchFeed(url) {
  let xml;

  try {
    const res = await fetch(`${PROXY_PRIMARY}${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.contents) throw new Error('Empty proxy response');
    xml = json.contents;
  } catch {
    try {
      const res = await fetch(`${PROXY_FALLBACK}${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      xml = await res.text();
    } catch {
      throw new Error(
        "We couldn't fetch your feed — it may be temporarily unavailable, or blocked from external access. Try again in a moment."
      );
    }
  }

  return xml;
}

function getText(el) {
  if (!el) return '';
  return (el.textContent || '').trim();
}

// querySelector('link') matches atom:link too because CSS selectors ignore XML namespaces.
// This finds the plain RSS <link> element (no namespace).
function getRssLink(parent) {
  return Array.from(parent.children).find(
    el => el.localName === 'link' && !el.namespaceURI
  ) || null;
}

function getItunesEl(parent, tagName) {
  return (
    parent.querySelector(`itunes\\:${tagName}`) ||
    parent.getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd', tagName)[0] ||
    Array.from(parent.getElementsByTagName('*')).find(el => el.localName === tagName) ||
    null
  );
}

function parseDurationSeconds(str) {
  if (!str) return null;
  str = str.trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/aac',
  'audio/mp4',
  'audio/wav',
  'video/mp4',
  'application/x-mpegurl',
];

export function validateFeed(xmlString, feedUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const parseError = doc.querySelector('parseerror');
  if (parseError) {
    throw new Error(
      'Your feed could not be parsed as valid XML. Check that the URL points directly to an RSS feed.'
    );
  }

  const rssEl = doc.documentElement;

  if (rssEl.localName === 'feed' && rssEl.getAttribute('xmlns') === 'http://www.w3.org/2005/Atom') {
    throw new Error(
      "This is an Atom feed, not an RSS 2.0 feed. Google News Briefings requires RSS 2.0 with audio enclosures. " +
      "YouTube's auto-generated feeds are Atom format and link to video embeds — they can't be submitted directly. " +
      "You'll need a separate podcast RSS feed hosted on a platform like Buzzsprout, Transistor, or Spotify for Podcasters."
    );
  }

  const channel = rssEl.querySelector('channel');

  if (!channel) {
    throw new Error("No <channel> element found. This doesn't appear to be a valid RSS 2.0 feed.");
  }

  const items = Array.from(channel.querySelectorAll(':scope > item'));
  const latestItem = items[0] || null;

  const checks = [];

  // ── Channel checks ────────────────────────────────────────────────────────

  const rssVersion = rssEl.getAttribute('version');
  checks.push({
    id: 'rss-version',
    label: 'RSS version is 2.0',
    status: rssVersion === '2.0' ? 'pass' : 'fail',
    detail: rssVersion === '2.0'
      ? `RSS version: ${rssVersion}`
      : `Feed must be RSS 2.0 (found: ${rssVersion || 'none'})`,
  });

  const itunesNs = rssEl.getAttribute('xmlns:itunes');
  checks.push({
    id: 'itunes-namespace',
    label: 'iTunes namespace declared',
    status: itunesNs ? 'pass' : 'fail',
    detail: itunesNs
      ? 'iTunes namespace present'
      : 'Missing xmlns:itunes declaration — required for <itunes:duration>',
  });

  const channelTitle = getText(channel.querySelector(':scope > title'));
  checks.push({
    id: 'channel-title',
    label: 'Channel has a title',
    status: channelTitle ? 'pass' : 'fail',
    detail: channelTitle || 'Feed is missing a channel title',
  });

  const channelLink = getText(getRssLink(channel));
  const linkOk = Boolean(channelLink && channelLink.startsWith('http'));
  checks.push({
    id: 'channel-link',
    label: 'Channel has a valid link',
    status: linkOk ? 'pass' : 'fail',
    detail: linkOk ? channelLink : 'Feed is missing a valid channel link URL',
  });

  const channelDesc = getText(channel.querySelector(':scope > description'));
  checks.push({
    id: 'channel-description',
    label: 'Channel has a description',
    status: channelDesc ? 'pass' : 'fail',
    detail: channelDesc
      ? `"${channelDesc.slice(0, 80)}${channelDesc.length > 80 ? '…' : ''}"`
      : 'Feed is missing a channel description',
  });

  const channelImageUrl =
    getText(channel.querySelector(':scope > image > url')) ||
    getItunesEl(channel, 'image')?.getAttribute('href') ||
    '';
  checks.push({
    id: 'channel-image',
    label: 'Channel has artwork',
    status: channelImageUrl ? 'pass' : 'fail',
    detail: channelImageUrl || 'Feed is missing a channel image',
  });

  checks.push({
    id: 'channel-image-size',
    label: 'Artwork is at least 1400×1400px',
    status: 'warn',
    detail: "Can't check image dimensions in-browser — verify manually that your artwork is at least 1400×1400px.",
  });

  // ── Item checks ───────────────────────────────────────────────────────────

  checks.push({
    id: 'item-exists',
    label: 'Feed has at least one episode',
    status: latestItem ? 'pass' : 'fail',
    detail: latestItem ? `${items.length} episode(s) found` : 'Feed has no episodes',
  });

  if (latestItem) {
    const itemTitle = getText(latestItem.querySelector('title'));
    checks.push({
      id: 'item-title',
      label: 'Latest episode has a title',
      status: itemTitle ? 'pass' : 'fail',
      detail: itemTitle ? `"${itemTitle}"` : 'Latest episode is missing a title',
    });

    const itemDesc = getText(latestItem.querySelector('description'));
    checks.push({
      id: 'item-description',
      label: 'Latest episode has a description',
      status: itemDesc ? 'pass' : 'fail',
      detail: itemDesc
        ? `"${itemDesc.slice(0, 80)}${itemDesc.length > 80 ? '…' : ''}"`
        : 'Latest episode is missing a description',
    });

    const enclosure = latestItem.querySelector('enclosure');
    const encUrl = enclosure?.getAttribute('url') || '';
    const encType = enclosure?.getAttribute('type') || '';
    const encLength = enclosure?.getAttribute('length') || '';
    const encOk = Boolean(enclosure && encUrl && encType && encLength);

    checks.push({
      id: 'item-enclosure',
      label: 'Latest episode has an enclosure tag',
      status: encOk ? 'pass' : 'fail',
      detail: encOk
        ? `Enclosure found (${encType})`
        : 'Latest episode is missing an enclosure tag (the audio file reference)',
    });

    if (enclosure) {
      const typeOk = SUPPORTED_AUDIO_TYPES.includes(encType.toLowerCase());
      checks.push({
        id: 'item-enclosure-type',
        label: 'Enclosure type is supported',
        status: typeOk ? 'pass' : 'fail',
        detail: typeOk
          ? `Type: ${encType}`
          : `Audio type '${encType}' may not be supported. Supported: mp3, aac, m4a, wav, mp4`,
      });

      const encUrlOk = encUrl && encUrl.startsWith('http');
      checks.push({
        id: 'item-enclosure-url',
        label: 'Enclosure URL is valid',
        status: encUrlOk ? 'pass' : 'fail',
        detail: encUrlOk ? encUrl : 'Enclosure URL is missing or malformed',
      });
    }

    const guid = getText(latestItem.querySelector('guid'));
    checks.push({
      id: 'item-guid',
      label: 'Latest episode has a GUID',
      status: guid ? 'pass' : 'fail',
      detail: guid || 'Latest episode is missing a GUID',
    });

    const pubDateStr = getText(latestItem.querySelector('pubDate'));
    const pubDate = pubDateStr ? new Date(pubDateStr) : null;
    const pubDateOk = Boolean(pubDate && !isNaN(pubDate.getTime()));
    checks.push({
      id: 'item-pubdate',
      label: 'Latest episode has a publication date',
      status: pubDateOk ? 'pass' : 'fail',
      detail: pubDateOk ? pubDateStr : 'Latest episode is missing a publication date',
    });

    if (pubDateOk) {
      const daysOld = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
      checks.push({
        id: 'item-freshness',
        label: 'Latest episode is recent',
        status: daysOld <= 7 ? 'pass' : 'warn',
        detail: daysOld <= 7
          ? `Published ${daysOld} day(s) ago`
          : `Latest episode is ${daysOld} days old. Google prefers daily or near-daily updates.`,
      });
    }

    const durationEl = getItunesEl(latestItem, 'duration');
    const durationStr = getText(durationEl);
    checks.push({
      id: 'item-duration',
      label: 'Episode has <itunes:duration>',
      status: durationStr ? 'pass' : 'fail',
      detail: durationStr ? `Duration: ${durationStr}` : 'Missing <itunes:duration> — required by Google',
    });

    if (durationStr) {
      const seconds = parseDurationSeconds(durationStr);
      let durationStatus = 'pass';
      let durationDetail = `Duration: ${durationStr}`;
      if (seconds !== null) {
        if (seconds < 60) {
          durationStatus = 'warn';
          durationDetail = `Episode is ${seconds}s — Google recommends 5–10 minutes for news briefings`;
        } else if (seconds > 1800) {
          durationStatus = 'warn';
          durationDetail = `Episode is ${Math.round(seconds / 60)} min — Google recommends 5–10 minutes for news briefings`;
        }
      }
      checks.push({
        id: 'item-duration-length',
        label: 'Episode duration is in recommended range',
        status: durationStatus,
        detail: durationDetail,
      });
    }
  }

  // ── Metadata extraction ───────────────────────────────────────────────────

  const enclosure = latestItem?.querySelector('enclosure');
  const latestDurationEl = latestItem ? getItunesEl(latestItem, 'duration') : null;
  const latestDurationSeconds = parseDurationSeconds(getText(latestDurationEl));

  const meta = {
    feedTitle: getText(channel.querySelector(':scope > title')),
    feedDescription: getText(channel.querySelector(':scope > description')),
    feedUrl,
    feedImageUrl:
      getText(channel.querySelector(':scope > image > url')) ||
      getItunesEl(channel, 'image')?.getAttribute('href') ||
      '',
    feedLanguage: getText(channel.querySelector(':scope > language')) || 'en-us',
    feedLink: getText(getRssLink(channel)),
    latestEpisodeTitle: latestItem ? getText(latestItem.querySelector('title')) : '',
    latestPubDate: latestItem ? getText(latestItem.querySelector('pubDate')) : '',
    enclosureType: enclosure?.getAttribute('type') || '',
    latestDurationSeconds,
  };

  return { checks, meta };
}
