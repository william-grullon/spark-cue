import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect directly to the database at the root
const dbPath = path.resolve(path.join(__dirname, '..'), 'db.sqlite');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

// Define the type for a picture
interface Picture {
    description: string;
}

// Define the type for a profile
interface Profile {
    name: string;
    bio: string;
    location: string;
    pictures: Picture[];
    avatar_url: string | null;
}

// Check if the profiles table exists
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles';").get();
if (tableCheck) {
    console.log('Profiles table exists.');
} else {
    console.error('Profiles table does not exist.');
    // Create the profiles table if it doesn't exist
    db.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bio TEXT,
      location TEXT,
      pictures TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
    console.log('Created profiles table.');
}

const profiles: Profile[] = [
    {
        name: "Olivia Smith",
        bio: "Loves coffee, books, and exploring new places. Always up for an adventure.",
        location: "New York, NY",
        pictures: [
            { description: "Smiling at a sunny park" },
            { description: "Holding a cup of coffee at a cafe" },
            { description: "Posing with a famous landmark" }
        ],
        avatar_url: null // Optional: Add URLs if you have them
    },
    {
        name: "Emma Johnson",
        bio: "Software engineer by day, aspiring chef by night. Enjoys hiking and yoga.",
        location: "San Francisco, CA",
        pictures: [
            { description: "Working on a laptop with code" },
            { description: "Kneading dough in the kitchen" },
            { description: "Standing on a mountain peak" }
        ],
        avatar_url: null
    },
    {
        name: "Ava Williams",
        bio: "Art student who loves painting, visiting museums, and spending time with her cat.",
        location: "Austin, TX",
        pictures: [
            { description: "Holding a paintbrush in front of an easel" },
            { description: "Admiring a painting in a gallery" },
            { description: "Cuddling a fluffy cat" }
        ],
        avatar_url: null
    },
    {
        name: "Sophia Brown",
        bio: "Passionate about sustainability and spends weekends volunteering at the local animal shelter.",
        location: "Portland, OR",
        pictures: [
            { description: "Planting trees with a group" },
            { description: "Walking a dog from the shelter" },
            { description: "Sorting recycling materials" }
        ],
        avatar_url: null
    },
    {
        name: "Isabella Jones",
        bio: "Travel enthusiast documenting her journeys. Loves photography and trying new foods.",
        location: "Denver, CO",
        pictures: [
            { description: "Taking a selfie in front of a waterfall" },
            { description: "Enjoying street food in a foreign market" },
            { description: "Reading a map on a cobblestone street" }
        ],
        avatar_url: null
    },
    {
        name: "Mia Garcia",
        bio: "Musician playing guitar in a local band. Enjoys live music and vintage shops.",
        location: "Nashville, TN",
        pictures: [
            { description: "Playing an acoustic guitar on stage" },
            { description: "Browsing records in a music store" },
            { description: "Trying on a vintage dress" }
        ],
        avatar_url: null
    },
    {
        name: "Charlotte Miller",
        bio: "Fitness lover, often found at the gym or running trails. Also enjoys quiet nights in.",
        location: "Chicago, IL",
        pictures: [
            { description: "Lifting weights at the gym" },
            { description: "Jogging along a beach at sunset" },
            { description: "Relaxing on the sofa with a movie" }
        ],
        avatar_url: null
    },
    {
        name: "Amelia Davis",
        bio: "Marketing professional with a love for fashion and interior design. Weekend brunch expert.",
        location: "Miami, FL",
        pictures: [
            { description: "Posing in a stylish outfit" },
            { description: "Showing off a newly decorated room" },
            { description: "Toasting with mimosas at brunch" }
        ],
        avatar_url: null
    },
    {
        name: "Harper Rodriguez",
        bio: "Teacher who enjoys reading, gardening, and spending time outdoors with her dog.",
        location: "Seattle, WA",
        pictures: [
            { description: "Reading a book in a garden" },
            { description: "Holding a freshly picked tomato" },
            { description: "Walking a golden retriever in the woods" }
        ],
        avatar_url: null
    },
    {
        name: "Evelyn Martinez",
        bio: "Freelance writer exploring the city's hidden gems. Loves cozy cafes and long walks.",
        location: "Boston, MA",
        pictures: [
            { description: "Writing in a notebook at a cafe" },
            { description: "Walking down a charming city alley" },
            { description: "Enjoying a picnic by the river" }
        ],
        avatar_url: null
    }
];

function seedDatabase() {
    console.log('Seeding database with profiles...');
    const stmt = db.prepare(`
    INSERT INTO profiles (name, bio, location, pictures, avatar_url) 
    VALUES (@name, @bio, @location, @pictures, @avatar_url)
  `);

    const insertMany = db.transaction((profilesToInsert: Profile[]) => {
        let insertedCount = 0;
        for (const profile of profilesToInsert) {
            // Check if profile already exists (simple check by name)
            const existing = db.prepare('SELECT id FROM profiles WHERE name = ?').get(profile.name);
            if (!existing) {
                stmt.run({
                    ...profile,
                    pictures: JSON.stringify(profile.pictures) // Store pictures as JSON string
                });
                insertedCount++;
            } else {
                console.log(`Profile "${profile.name}" already exists, skipping.`);
            }
        }
        return insertedCount;
    });

    try {
        const count = insertMany(profiles);
        console.log(`Seeding finished. Inserted ${count} new profiles.`);
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

// Run the seeding function
seedDatabase();

// Close the database connection
db.close();
console.log('Database connection closed.');
