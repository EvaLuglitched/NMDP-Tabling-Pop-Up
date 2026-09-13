export interface CampaignStats {
  totalVisits: number;
  uniqueVisitors: number;
  qrVisits: number;
  qrOpenRate: number;
  totalPledges: number;
  conversionRate: number;
  totalEngagedUsers: number;
  sources: Record<string, number>;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  events: {
    calendar_add: number;
    map_opened: number;
    quiz_answered: number;
    share_clicked: number;
    invitation_downloaded: number;
    flyer_printed: number;
    qr_scanned: number;
    pledge_submitted: number;
  };
  recentActivities: {
    id: string;
    time: string;
    type: 'visit' | 'interaction' | 'pledge';
    text: string;
    source: string;
  }[];
  lastUpdated: string;
}

export interface PledgeItem {
  id: string;
  timestamp: string;
  name: string;
  affiliation: 'Undergraduate' | 'Graduate / MDes' | 'Faculty / Staff' | 'Berkeley Community' | 'Visitor';
  timePreference: string;
  reminderType: 'email' | 'sms' | 'calendar_only';
  contactMasked?: string;
  pledgeNote?: string;
  source: string;
}

export type DesignTheme = 'ethereal' | 'berkeley' | 'minimalist';

export type CampusSpot = 
  | 'amazon_hub_flyer'
  | 'campus_poster_sproul'
  | 'moffitt_library_table'
  | 'mdes_slack'
  | 'instagram_mdes';

export interface SpotConfig {
  id: CampusSpot;
  label: string;
  location: string;
  type: string;
}
