import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function migrateProfiles() {
  console.log('Starting profile migration...');
  
  // Fetch all profiles from Supabase
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles.length} profiles to migrate`);

  // Migrate each profile to Firestore
  for (const profile of profiles) {
    try {
      // Convert DOB format if needed
      const dob = profile.dob ? {
        year: profile.dob.split('-')[0],
        month: profile.dob.split('-')[1],
        day: profile.dob.split('-')[2]
      } : { year: '', month: '', day: '' };

      // Create profile document in Firestore
      await setDoc(doc(db, 'profiles', profile.id), {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        preferred_name: profile.preferred_name || '',
        dob,
        avatar_url: profile.avatar_url || '',
        phone: profile.phone || ''
      });

      console.log(`Migrated profile for user ${profile.id}`);
    } catch (error) {
      console.error(`Error migrating profile ${profile.id}:`, error);
    }
  }
}

async function migrateStorage() {
  console.log('Starting storage migration...');
  
  // Fetch all profiles to get avatar URLs
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .not('avatar_url', 'is', null);

  if (error) {
    console.error('Error fetching avatar URLs:', error);
    return;
  }

  console.log(`Found ${profiles.length} avatars to migrate`);

  // Create a temporary directory for downloads
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Migrate each avatar
  for (const profile of profiles) {
    try {
      if (!profile.avatar_url) continue;

      // Download the file from Supabase
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('avatars')
        .download(profile.avatar_url);

      if (downloadError) {
        console.error(`Error downloading avatar for ${profile.id}:`, downloadError);
        continue;
      }

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${profile.id}`);
      await uploadBytes(storageRef, fileData);
      const downloadURL = await getDownloadURL(storageRef);

      // Update the profile in Firestore with the new URL
      await setDoc(doc(db, 'profiles', profile.id), {
        avatar_url: downloadURL
      }, { merge: true });

      console.log(`Migrated avatar for user ${profile.id}`);
    } catch (error) {
      console.error(`Error migrating avatar for ${profile.id}:`, error);
    }
  }

  // Clean up temporary directory
  fs.rmSync(tempDir, { recursive: true, force: true });
}

async function main() {
  try {
    await migrateProfiles();
    await migrateStorage();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main(); 