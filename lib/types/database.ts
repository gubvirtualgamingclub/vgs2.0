// Database table type definitions for VGS 2.0

export interface Update {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  image_url?: string;
  buttons?: {
    name: string;
    link: string;
  }[];
}

export interface Guest {
  name: string;
  photo: string;
  designation: string;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  participants: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  is_featured: boolean;
  // New fields from v3.1.0
  banner_image_url?: string;
  short_description?: string;
  facebook_post_url?: string;
  tags?: string[];
  guests?: Guest[];
  sponsors?: Sponsor[]; // This will be populated by a join query
}

// Organization structure for tournaments
export interface Organization {
  name: string;
  logo: string; // Path or URL to logo image
}

// ============================================
// Tournament Types
// ============================================

// Single active tournament (only one exists at a time)
export interface Tournament {
  id: string;
  name: string;
  slogan?: string;
  logo?: string;
  banner?: string;
  banner_source?: 'url' | 'path';
  teaser_video_url?: string; // New
  description?: string;
  about_event?: string; // New
  about_organizer?: string; // New
  previous_glimpses?: { id: string; title: string; images: string[] }[]; // New
  date: string;
  time: string;
  venue: string;
  total_prize_pool: string;
  registration_deadline: string;
  organizers?: Organization[];
  co_organizers?: Organization[];
  associated_with?: Organization[];
  sponsors?: Organization[];
  status: 'open' | 'closed';
  registration_status?: 'open' | 'closed';
  show_schedule?: boolean;
  show_results?: boolean;
  created_at: string;
  updated_at: string;
}

// New: Tournament Schedules
export interface TournamentSchedule {
  id: string;
  tournament_id: string;
  game_id?: string; // Optional (if general schedule)
  title: string;
  match_time: string;
  stage?: string; // e.g., "Qualifiers", "Finals"
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// New: Tournament Results
export interface TournamentResult {
  id: string;
  tournament_id: string;
  game_id?: string;
  stage_name: string; // e.g., "Grand Final"
  result_data: any; // JSONB structure for flexibility (leaderboard array)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Individual games within a tournament
export interface TournamentGame {
  id: string;
  tournament_id: string;
  game_name: string;
  game_logo?: string;
  category: 'casual' | 'mobile' | 'pc';
  icon: string;
  description: string;
  prize_pool: string;
  team_size: string;
  format?: string;
  schedule?: string;
  max_participants?: string;
  registration_link: string;
  rulebook_link: string;
  registration_status?: 'open' | 'closed';
  registration_fee?: string; // New field for BDT fee
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'sponsor' | 'collaborator';
  sponsor_types?: string[]; // Changed to array for multiple categories
  collaborator_types?: string[]; // Changed to array for multiple categories
  custom_type_name?: string;
  website: string;
  description: string;
  events: string[]; // Array of event IDs or names they sponsored/collaborated with
  display_order: number;
  social_media: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  created_at: string;
  updated_at: string;
  is_published: boolean;
  is_featured: boolean;
}

// Committee Group (Parent)
export interface Committee {
  id: string;
  name: string;
  year_range: string; // e.g., "2025-2026"
  description?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

// Committee Member (Child)
export interface CommitteeMember {
  id: string;
  committee_id: string;
  name: string;
  category: 'Faculty Advisors' | 'Student Executives';
  designation: string;
  photo: string;
  email?: string;
  student_id?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  previous_roles: Array<{ year: string; role: string }> | string[]; // Support both new format and legacy
  order_index: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

// ============================================
// Registration Form Types
// ============================================

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'tel' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'time' 
  | 'file';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  helpText?: string;
}

export interface RegistrationForm {
  id: string;
  game_name: string;
  game_slug: string;
  title: string;
  description?: string;
  google_sheet_url: string;
  form_fields: FormField[];
  is_active: boolean;
  registration_deadline?: string;
  registration_fee?: string;
  club_logo_url?: string;
  tournament_logo_url?: string;
  game_logo_url?: string;
  // Enhanced Design Fields
  hero_image_url?: string;
  hero_image_source?: 'url' | 'path';
  primary_color?: string; // Hex color (e.g., '#6B46C1')
  secondary_color?: string; // Hex color (e.g., '#EC4899')
  accent_color?: string; // Hex color (e.g., '#3B82F6')
  heading_font?: 'default' | 'modern' | 'gaming' | 'elegant'; // Font family presets
  body_font?: 'default' | 'modern' | 'gaming' | 'elegant';
  created_at: string;
  updated_at: string;
}

// ============================================
// Payment Types
// ============================================

export interface PaymentMethod {
  id: string;
  name: string; // e.g., Bkash, Nagad
  number: string;
  logo_url?: string;
  instructions?: string;
  account_type: 'personal' | 'merchant' | 'agent';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistrationSubmission {
  id: string;
  form_id: string;
  submission_data: Record<string, any>;
  submitted_at: string;
  ip_address?: string;
  user_agent?: string;
  transaction_id?: string;
  payment_method_id?: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivitySponsor {
  activity_id: string;
  sponsor_id: string;
  created_at: string;
}

// ============================================
// Games Types
// ============================================

export interface GameEvent {
  id: string;
  game_id: string;
  event_id: string;
  participants_count: number;
  created_at: string;
  event?: Activity; // Will be populated by join query
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  logo_source: 'url' | 'path';
  description?: string;
  game_type: 'casual' | 'mobile' | 'pc'; // Category: casual, mobile, pc
  game_mode?: 'team' | 'individual'; // Team or Individual
  team_size?: string; // e.g., "2v2", "3v3", "4v4", "5v5"
  times_hosted: number;
  participants_count: number;
  max_participants?: number;
  rules?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  display_order: number;
  // Populated by join query
  events?: GameEvent[];
  history?: GameHistory[];
}

export interface GameHistory {
  id: string;
  game_id: string;
  event_name: string;
  year: number;
  month: number; // 1-12
  participants_count: number;
  prize_pool?: string;
  event_link?: string; // Facebook link, website link, etc.
  created_at: string;
  updated_at: string;
}

// ============================================
// Email Management Types
// ============================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  template_id?: string;
  google_sheet_url: string;
  subject: string;
  recipients_count: number;
  recipients_data: {
    name: string;
    email: string;
    sent: boolean;
    error?: string;
  }[];
  sent_by?: string;
  status: 'success' | 'failed' | 'partial';
  error_message?: string;
  sent_at: string;
}

export interface Participant {
  name: string;
  email: string;
}

// Database table names
export type TableName = 'updates' | 'activities' | 'tournaments' | 'sponsors' | 'committees' | 'committee_members' | 'registration_forms' | 'registration_submissions' | 'site_settings' | 'activity_sponsors' | 'games' | 'game_events' | 'game_history' | 'email_templates' | 'email_logs' | 'payment_methods';

// Union type for all database records
export type DatabaseRecord = Update | Activity | Tournament | Sponsor | Committee | CommitteeMember | RegistrationForm | RegistrationSubmission | SiteSetting | ActivitySponsor | Game | GameHistory | EmailTemplate | EmailLog | PaymentMethod;
