**PRODUCT SPEC: "Surabhi Alumni Memory Book"**

**🎯 1. Core Vision**

A **secure, emotionally meaningful digital memory system** where
final-year students write personal messages for each other, which are
later transformed into **AI-crafted lifelong memory notes**.

This is not just a form or webpage.

👉 It is a **legacy product** for the institution.

**🧠 2. Key Experience Flow (User Journey)**

**Phase 1: Onboarding (First Entry via WhatsApp Link)**

-   Each student receives a **unique, encrypted link** via WhatsApp

-   Link is tied to:

    -   Enrollment Number

    -   Mobile Number

**On First Click:**

User is taken to:

👉 "Complete Your Profile" page

**Fields:**

-   Full Name (auto-filled if available)

-   Enrollment Number (locked)

-   Mobile Number (locked)

-   Email (required for login later)

-   Profile Picture Upload

-   Optional:

    -   Nickname

    -   Short bio (1--2 lines)

Social Media Profiles (NEW SECTION)\
\
- Mandatory:\
· LinkedIn Profile URL (required)\
\
- Optional:\
· Instagram Profile URL\
· GitHub Profile URL\
· Twitter/X Profile URL\
· Personal Portfolio / Website\
\
-Validation Rules:\
· LinkedIn must contain: linkedin.com/in/\
· All URLs must be valid format\
· User cannot proceed without LinkedIn

**Phase 2: Writing Messages (20-Day Window)**

After profile completion → user enters:

👉 "Write Memories" Interface

**✍️ Writing Interface Requirements**

-   Clean, distraction-free UI

-   Input box with:

**🔹 Smart Tagging System**

-   User types @

-   Dropdown appears:

    -   Name + Enrollment Number

-   Prevent duplicate tagging confusion

**🔹 Message Rules:**

-   Character Limit: **400--600 characters per message**

-   Max Messages Per User:

    -   Default: **100**

    -   Configurable via Admin Panel

-   One message = one recipient

```{=html}
<!-- -->
```
-   User can write for multiple people

**🔒 Privacy Rules (CRITICAL)**

-   Messages are:

    -   ❌ NOT visible to anyone else

    -   ❌ NOT visible to recipient

    -   ✅ ONLY visible to moderator

**⏳ Phase Control**

-   Writing window: **20 days**

-   After that:

    -   Writing is locked

    -   No edits allowed

**🧑‍🏫 3. Moderator Panel (Admin Dashboard)**

This is where your idea becomes powerful.

**Moderator Capabilities:**

**🔍 View Raw Messages**

-   Filter by:

    -   Student Name

    -   Enrollment Number

-   View:

    -   All messages written *about* a student

**🤖 AI Summarization Engine**

For each student:

Input:

-   5--50 raw peer messages

Output:

-   4--6 line emotional summary

**Tone Guidelines:**

-   Warm

-   Personal

-   Specific (not generic fluff)

-   Nostalgic

**Example Output Style:**

"You were the silent strength of the group---always calm, always
dependable. From late-night submissions to last-minute plans, you were
the one everyone counted on. Your presence made chaos feel manageable.
Years from now, people may forget the assignments---but they won't
forget you."

**Moderator Controls:**

-   Edit AI output (optional)

-   Approve final version

-   Publish

**🔐 4. Alumni Portal (Post-Launch Experience)**

Accessible via:

👉 College Website → "Alumni Network"

**Login Methods:**

-   Email + Email OTP

-   Mobile + Email OTP (OTP always sent to email)

(In Phase2, we will introduce Mobile OTP)

**Flow:**

1.  User enters Email OR Mobile

2.  System fetches mapped email

3.  OTP sent to registered email

4.  User enters OTP → Login success

**After Login → Dashboard**

**🎉 Personal Memory Card**

Each user sees:

• Profile Picture

• Full Name

• Enrollment Number

• AI-Generated Memory Message

🔗 Social Presence\
\
· LinkedIn (highlighted, always shown) (Edited, can be changed/updated
by the user anytime, however, the all the records, of previous one, and
updated one must be maintained in database)\
· Other social profiles (shown only if provided) (Edited, can be
changed/updated by the user anytime, however, the all the records, of
previous one, and updated one must be maintained in database)\
\
Note:\
These profiles are visible to all logged-in alumni to enable networking.

**🌐 Explore Others (My Batchmates)**

-   View:

    -   Their Profile Picture

    -   Their Full Name

    -   Their Enrollment Number

    -   Their AI-Generated Memory Message

    -   LinkedIn (highlighted, always shown) (Have an icon, if user
        click, they are redirected to that user LinkedIn Page)

    -   

**🚫 What they CANNOT see:**

-   Raw messages

-   Who wrote what

**🧩 5. Additional Sections (Alumni Network Tab)**

**💼 Job Openings (Future Placeholder)**

-   Menu item: "Job Opportunities"

-   Page content:

> "Coming Soon"

(Subtle signal of future ecosystem)

**🌟 Alumni Showcase**

Display:

-   Photo

-   Name

-   Role

-   Company

Purpose:\
👉 Social proof + inspiration

**🧱 6. System Architecture (Enterprise Level)**

**TAKE YOUR OWN DECISION**

**🔐 7. Security & Integrity**

-   Encrypted unique links per user

-   Rate limiting

-   No message visibility leaks

-   Admin-only access to raw data

**⚙️ 8. Smart Features (Make it "WOW")**

**💡 Emotion Amplifier (AI Enhancement)**

Before summarizing:

-   AI detects:

    -   Traits (funny, helpful, leader, silent supporter)

-   Builds structured memory

**🧠 Duplicate Filtering**

If 10 people say:

"Very helpful"

AI merges intelligently instead of repeating

**🎯 Highlight Anchors**

AI identifies:

-   Unique moments

-   Specific behaviors

**📊 9. Metrics to Track**

-   \% students onboarded

-   Messages per student

-   Completion rate

-   AI summaries generated

**🧪 10. Suggested Timeline**

  -----------------------------------------------------------------------
  **Phase**                                       **Time**
  ----------------------------------------------- -----------------------
  Design + Spec Freeze                            2 days

  Development                                     7--10 days

  Testing                                         2--3 days

  Launch                                          Day 15
  -----------------------------------------------------------------------

**Launch Date** : 15^th^ May 2025

**📢 11. Communication Strategy**

-   WhatsApp blast with personalized links

-   Reminder nudges (Day 5, 10, 15, 18, 19, 20)

**Note : This is a controlled, privacy-first emotional memory system
with AI transformation.**

# DATABASE DESIGN

## 1. users Table

Stores all student data.

users (\
id UUID PRIMARY KEY,\
enrollment_number VARCHAR UNIQUE NOT NULL,\
full_name VARCHAR NOT NULL,\
email VARCHAR UNIQUE NOT NULL,\
mobile VARCHAR UNIQUE NOT NULL,\
profile_picture_url TEXT,\
nickname VARCHAR,\
bio TEXT,\
is_profile_completed BOOLEAN DEFAULT FALSE,\
created_at TIMESTAMP,\
updated_at TIMESTAMP\
)

1A. social_profiles Table (NEW)

Stores user social media links.

social_profiles (

id UUID PRIMARY KEY,

user_id UUID REFERENCES users(id),

platform VARCHAR NOT NULL, \-- linkedin, instagram, github, etc.

profile_url TEXT NOT NULL,

is_verified BOOLEAN DEFAULT FALSE,

created_at TIMESTAMP,

updated_at TIMESTAMP

)

## 2. auth_otps Table

Handles OTP login securely.

auth_otps (\
id UUID PRIMARY KEY,\
user_id UUID REFERENCES users(id),\
otp_code VARCHAR,\
expires_at TIMESTAMP,\
is_used BOOLEAN DEFAULT FALSE,\
created_at TIMESTAMP\
)

## 3. message_window Table

Controls 20-day writing window.

message_window (\
id UUID PRIMARY KEY,\
start_date TIMESTAMP,\
end_date TIMESTAMP,\
is_active BOOLEAN\
)

👉 This allows:

-   Easy extension/change later

-   No hardcoding

## 4. messages Table (CORE TABLE)

Stores all raw messages.

messages (\
id UUID PRIMARY KEY,\
sender_id UUID REFERENCES users(id),\
recipient_id UUID REFERENCES users(id),\
message_text TEXT NOT NULL,\
character_count INT,\
created_at TIMESTAMP\
)

### 🔒 Important Constraints:

-   No self-messaging:

CHECK (sender_id != recipient_id)

-   Character validation handled at backend (400--600)

## 5. message_limits Table (CONFIGURABLE)

message_limits (\
id UUID PRIMARY KEY,\
max_messages_per_user INT DEFAULT 100,\
min_characters INT DEFAULT 400,\
max_characters INT DEFAULT 600,\
updated_at TIMESTAMP\
)

## 6. ai_summaries Table

Stores final generated memory.

ai_summaries (\
id UUID PRIMARY KEY,\
user_id UUID REFERENCES users(id),\
summary_text TEXT,\
generated_by_ai BOOLEAN DEFAULT TRUE,\
is_approved BOOLEAN DEFAULT FALSE,\
created_at TIMESTAMP,\
updated_at TIMESTAMP\
)

## 7. admin_users Table

admin_users (\
id UUID PRIMARY KEY,\
name VARCHAR,\
email VARCHAR UNIQUE,\
role VARCHAR, \-- super_admin / moderator\
created_at TIMESTAMP\
)

## 8. audit_logs Table 

Tracks critical actions.

audit_logs (\
id UUID PRIMARY KEY,\
admin_id UUID,\
action TEXT,\
target_user_id UUID,\
metadata JSONB,\
created_at TIMESTAMP\
)

# 🔗 RELATIONSHIP SUMMARY

-   One user → many messages sent

-   One user → many messages received

-   One user → one AI summary

# ⚙️ BACKEND LOGIC 

## ✍️ Message Submission Logic

When user submits:

1.  Check:

    -   Is message window active?

    -   Has user exceeded 100 messages?

    -   Character count between 400--600?

2.  Insert into messages

🔗 Social Profile Handling\
\
During Profile Completion:\
1. Validate LinkedIn (mandatory)\
2. Validate other URLs (if provided)\
3. Insert into users table\
4. Insert each profile into social_profiles table\
\
Fetching Social Profiles:\
SELECT platform, profile_url\
FROM social_profiles\
WHERE user_id = ?

## 🧠 AI Summarization Flow

For each user:

SELECT message_text\
FROM messages\
WHERE recipient_id = ?

Then:

-   Send all messages to AI

-   Generate summary

-   Store in ai_summaries

## 🧑‍🏫 Moderator Workflow

1.  Select student

2.  View all raw messages

3.  Click:

    -   "Generate AI Summary"

4.  Review output

5.  Approve → visible to student

# 🔐 SECURITY DESIGN

## 🔒 Access Rules

  -----------------------------------------------------------------------
  **Role**             **Access**
  -------------------- --------------------------------------------------
  Student              Only own summary

  Admin                All messages

  System               AI processing
  -----------------------------------------------------------------------

## 🔐 Critical Safeguards

-   No API should expose:

    -   Raw messages to students

-   Use:

    -   Row-level access control

    -   Token-based auth

· Social profile links are public within authenticated alumni users only

# 📦 OPTIONAL (BUT HIGH VALUE)

## 1. notifications Table

For reminders:

notifications (\
id UUID PRIMARY KEY,\
user_id UUID,\
type VARCHAR,\
message TEXT,\
is_read BOOLEAN DEFAULT FALSE,\
created_at TIMESTAMP\
)

## 2. alumni_showcase Table

alumni_showcase (\
id UUID PRIMARY KEY,\
name VARCHAR,\
role VARCHAR,\
company VARCHAR,\
image_url TEXT,\
display_order INT\
)

This system must be:

-   Privacy-first (no message leaks)

-   Configurable (limits, window, etc.)

-   AI-integrated (summarization layer)

-   Scalable (future alumni features like jobs, networking)

# 💡 ONE STRATEGIC SUGGESTION

Don't rush AI Summarization part blindly.

👉 First ensure:

-   High-quality messages collected

Because:

Garbage in → emotional nonsense out
