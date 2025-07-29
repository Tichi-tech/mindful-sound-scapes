// Test script to check database status of generated tracks
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mtypyrsdbsoxrgzsxwsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXB5cnNkYnNveHJnenN4d3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTY5NzQsImV4cCI6MjA2NzU3Mjk3NH0.rIRFbCR4fFDftKrSu0EykIHrl91cKHN3hP8BRE-XOdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrackStatus() {
  try {
    console.log('🎵 Checking recent generated tracks...\n');
    
    const { data: tracks, error } = await supabase
      .from('generated_tracks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching tracks:', error);
      return;
    }

    if (!tracks || tracks.length === 0) {
      console.log('📝 No tracks found in database');
      return;
    }

    console.log(`📊 Found ${tracks.length} recent tracks:\n`);
    
    tracks.forEach((track, index) => {
      console.log(`${index + 1}. Track ID: ${track.id}`);
      console.log(`   Title: ${track.title}`);
      console.log(`   Status: ${track.status}`);
      console.log(`   Prompt: ${track.prompt}`);
      console.log(`   Style: ${track.style}`);
      console.log(`   Duration: ${track.duration}`);
      console.log(`   Audio URL: ${track.audio_url ? 'Available' : 'Not ready'}`);
      console.log(`   Created: ${new Date(track.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check specifically for completed tracks
    const completedTracks = tracks.filter(t => t.status === 'completed' && t.audio_url);
    console.log(`✅ ${completedTracks.length} tracks have completed generation`);
    
    const generatingTracks = tracks.filter(t => t.status === 'generating');
    console.log(`⏳ ${generatingTracks.length} tracks are still generating`);
    
    const failedTracks = tracks.filter(t => t.status === 'failed');  
    console.log(`❌ ${failedTracks.length} tracks failed generation`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTrackStatus();