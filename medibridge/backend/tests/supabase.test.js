/**
 * MediBridge — Supabase Integration Test Suite
 * Run with: npm test   OR   node tests/supabase.test.js
 *
 * Tests: signup, login, profile CRUD, health profile, symptom history,
 *        favorite doctors, chat history, RLS isolation.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
    console.error('\n❌  Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env\n');
    process.exit(1);
}

const hasServiceKey = SERVICE_KEY && SERVICE_KEY !== 'your-supabase-service-role-key-here';
if (!hasServiceKey) {
    console.log('\n⚠️  Notice: SUPABASE_SERVICE_ROLE_KEY not set. Admin/Cleanup tests will be skipped.\n');
}

const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
const supabaseAdmin = hasServiceKey ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } }) : null;

// ─── Test helpers ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const tests = [];

function test(name, fn) { tests.push({ name, fn }); }

async function run() {
    console.log('\n🧪  MediBridge Supabase Test Suite\n' + '─'.repeat(55));
    for (const t of tests) {
        try {
            await t.fn();
            console.log(`  ✅  ${t.name}`);
            passed++;
        } catch (e) {
            console.error(`  ❌  ${t.name}`);
            console.error(`       → ${e.message}`);
            failed++;
        }
    }
    console.log('\n' + '─'.repeat(55));
    console.log(`  Results: ${passed} passed, ${failed} failed\n`);
    if (failed > 0) process.exit(1);
}

// ─── Test state ───────────────────────────────────────────────────────────────
const testEmail = `test_${Date.now()}@medibridge-test.com`;
const testPassword = 'Test@123456';
let accessToken = '';
let userId = '';
let favId = '';
let historyId = '';
let chatId = '';

// ─── Tests ────────────────────────────────────────────────────────────────────

test('Supabase connection', async () => {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST301') throw new Error(error.message);
});

test('User signup', async () => {
    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: { data: { name: 'Test User' } }
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user returned');
    userId = data.user.id;
});

test('User login', async () => {
    // For testing: confirm user via admin, then login
    // (If email confirmation is OFF in Supabase, login works immediately)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });
    if (error) {
        // If email confirmation is required, skip auth-dependent tests gracefully
        if (error.message.includes('Email not confirmed')) {
            console.log('       ℹ️  Email confirmation required in Supabase project settings');
            console.log('       ℹ️  Disable "Confirm email" in Authentication → Settings to skip this');
            throw new Error('Email confirmation required — disable it in Supabase Auth settings for local dev');
        }
        throw new Error(error.message);
    }
    accessToken = data.session.access_token;
    userId = data.user.id;
});

test('Insert profile', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('profiles')
        .upsert({
            user_id: userId,
            name: 'Test User',
            email: testEmail,
            phone: '+910000000000',
            gender: 'prefer_not_to_say',
            date_of_birth: '1995-06-15',
            bio: 'Test bio'
        }, { onConflict: 'user_id' })
        .select().single();
    if (error) throw new Error(error.message);
    if (!data.id) throw new Error('Profile not returned');
});

test('Update profile', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('profiles')
        .update({ bio: 'Updated bio — test run' })
        .eq('user_id', userId)
        .select().single();
    if (error) throw new Error(error.message);
    if (data.bio !== 'Updated bio — test run') throw new Error('Bio not updated');
});

test('Insert health profile', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('health_profiles')
        .upsert({
            user_id: userId,
            height: 175,
            weight: 70,
            blood_group: 'O+',
            allergies: ['Pollen', 'Dust'],
            chronic_conditions: ['None'],
            medications: [],
            lifestyle_flags: { smoker: false, alcohol: false },
            emergency_contact: { name: 'Emergency Contact', phone: '+910000000001', relation: 'Family' }
        }, { onConflict: 'user_id' })
        .select().single();
    if (error) throw new Error(error.message);
    if (!data.id) throw new Error('Health profile not returned');
});

test('Insert symptom history', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('symptom_history')
        .insert({
            user_id: userId,
            symptoms_input: ['headache', 'fever', 'fatigue'],
            predicted_disease: 'Common Cold',
            confidence_score: 0.87,
            precautions: ['Rest', 'Hydration'],
            medicines: ['Paracetamol']
        })
        .select().single();
    if (error) throw new Error(error.message);
    historyId = data.id;
});

test('Insert favorite doctor', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('favorite_doctors')
        .insert({
            user_id: userId,
            doctor_name: 'Dr. Test Doctor',
            hospital_name: 'Test Hospital',
            specialty: 'General Physician',
            location: 'Hyderabad, India',
            contact_info: { phone: '+910000000002' }
        })
        .select().single();
    if (error) throw new Error(error.message);
    favId = data.id;
});

test('Insert chat history', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('chat_history')
        .insert({
            user_id: userId,
            user_message: 'I have a headache',
            ai_response: 'Headaches can be caused by stress or dehydration. Drink water and rest.'
        })
        .select().single();
    if (error) throw new Error(error.message);
    chatId = data.id;
});

test('Fetch data with RLS (own data visible)', async () => {
    const client = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    const { data, error } = await client.from('profiles').select('*').eq('user_id', userId);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Own profile not visible');
});

test('RLS isolation — anon cannot read protected tables', async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    // RLS should return empty or PGRST301 error (not an actual data leak)
    if (error && error.code !== 'PGRST301') throw new Error(`Unexpected error: ${error.message}`);
    if (data && data.length > 0) throw new Error('RLS VIOLATED — anon client can see profile data!');
});

test('Cleanup — delete test user data', async () => {
    if (!hasServiceKey) {
        console.log('       ℹ️  Skipping cleanup (missing service key)');
        return;
    }
    // Use admin client to clean up test data
    await supabaseAdmin.from('chat_history').delete().eq('user_id', userId);
    await supabaseAdmin.from('favorite_doctors').delete().eq('user_id', userId);
    await supabaseAdmin.from('symptom_history').delete().eq('user_id', userId);
    await supabaseAdmin.from('health_profiles').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    if (userId) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
    }
});

run();
