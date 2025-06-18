# StoryNest – Product Requirements Document (PRD)

## Overview

StoryNest is a vibrant, modern web-based and mobile-friendly platform that lets parents or caregivers generate personalized bedtime stories for children aged one through twelve. The platform features beautiful, engaging design with cool transitions that captivates kids, toddlers, and teenagers alike. Each story is created on-demand with OpenAI GPT-4o, accompanied by AI-generated illustrations from DALL·E 3 in a gentle, child-safe Pixar-like art style. Every parent account can host multiple child profiles, maintains character consistency across stories, allows custom character creation, remembers reading progress automatically, stores finished stories and images in Wasabi S3 buckets for low-cost scalability, and recommends new stories based on age, prior reading habits, and preferred genres.

## Problem and Opportunity

Parents often reach the evening routine without fresh reading material, meanwhile kids increasingly expect interactive, customized content with characters they can connect with consistently. Existing AI-story apps such as BedtimeStory.ai, Oscar Stories, and Storytime AI demonstrate strong traction but lack character consistency and customization features. BedtimeStory.ai sells a subscription at roughly eight dollars per month when billed annually, Oscar monetizes through a four-ninety-nine subscription plus coin bundles, and Storytime AI charges four-ninety-nine monthly or nineteen-ninety-nine yearly for premium access. These price points confirm both willingness to pay and a competitive landscape, yet there is room for an experience that unifies fast story generation, rich imagery, character consistency, custom character creation, reading-progress sync, and a print-on-demand upsell.

## Goals and Metrics

The six-month objectives are: keep median end-to-end story creation below eight seconds, reach twenty-five-thousand monthly active parents, convert at least four percent of free users to a paid plan, drive an average of twelve completed stories per active child each month, and maintain character consistency across ninety-five percent of multi-story series. Backend availability should remain above ninety-nine-point-five percent with seamless character data persistence.

## Target Users

The primary persona is the busy parent who wants a safe, low-friction storytelling aid with consistent characters that children can bond with over time. A secondary persona is the early reader who uses the app on a tablet to explore images independently and wants to see familiar characters in new adventures. A third persona is the curious pre-teen who demands longer, genre-specific adventures with customizable protagonists and perhaps a series model featuring their personalized characters.

## Core Functional Scope

### Story Generation
Prompt templates scale vocabulary and sentence complexity to the selected age band, incorporate character consistency instructions to maintain appearance and personality traits across stories, add an explicit moral if the parent requests it, and return a structured JSON object containing a title, character descriptions, a page array, and a brief summary. The system maintains a character database per child profile to ensure consistency in appearance, personality, and backstory elements.

### Character Creation and Consistency
When creating a new story, users can describe their main character's appearance, personality, and special traits. The system stores these character profiles and references them in future stories to maintain consistency. Character descriptions follow the Pixar-like style guide: charming illustrations with expressive, friendly faces, large round eyes, slightly rosy cheeks, and gentle smiles. For animal characters, features like oversized glasses, cozy clothing, and warm expressions enhance their intelligent and adorable appearance. The system maintains character consistency by referencing stored character profiles and generating specific prompts that preserve visual and personality traits across multiple stories.

### Illustrations
One full-bleed cover or one image per page is created through DALL·E 3 using character-consistent prompts, filtered by OpenAI moderation, then stored as PNG in the user's Wasabi folder. All illustrations follow the warm, vibrant Pixar-like style with soft lighting and rich, vivid colors that evoke an inviting, adventurous, storybook-like feeling. Character appearances are maintained through detailed prompt engineering that references stored character descriptions.

### User Interface and Design
Every page follows a cohesive vibrant theme with modern, beautiful design elements that engage kids, toddlers, and teenagers. The interface features cool transitions, smooth animations, and interactive elements that make navigation feel magical. Color schemes use warm, inviting palettes with high contrast for readability. Typography is child-friendly but sophisticated, with different font sizes automatically scaling based on the child's age profile.

### Authentication and Profiles
Email-password plus Google or Apple sign-in, unlimited child profiles under a single guardian account, COPPA-compliant consent and data deletion flow. Each child profile stores character preferences, favorite story types, and reading level data to personalize future story generation and character consistency.

### Reading Progress and Character Tracking
The last page index and timestamp for each child–story pair is written to the database on every page-turn event, so parents can switch devices seamlessly. Character appearance and personality data is tracked per child profile to ensure consistency across story series and enable character development over time.

### Recommendations
An embeddings-based similarity service surfaces new stories matching favorite genres, characters, or themes, and also highlights timely themes such as holidays. The recommendation engine considers character preferences and suggests continuing adventures with established characters or introducing compatible new characters that fit the child's preferences.

### Analytics
Segment captures generation latency, page turns, character creation events, character consistency ratings, subscriptions, and churn to inform growth experiments and character development features.

### Scalability
A stateless Node.js API layer runs in containers on AWS Fargate, long-running image calls queue through a serverless worker pool, character data is cached for fast retrieval, and all static assets and JSON are delivered from Wasabi via signed URLs.

## Data Design

Key tables include User (plan tier and Stripe customer ID), ChildProfile (age, avatar, character preferences), Story (JSON payload, character references, and illustration URIs), CharacterProfile (appearance description, personality traits, backstory elements), ReadingProgress (current page per child), and SubscriptionEvent (billing history). Character consistency is maintained through a CharacterStory junction table that links characters to stories and tracks character development arcs. Assets reside under `stories/{userId}/{storyId}/` and `characters/{userId}/{childId}/` in Wasabi, keeping application servers free of binary storage while ensuring character images are consistently accessible.

## Character Consistency Instructions

### Visual Consistency Standards
All character illustrations must maintain consistent visual elements across stories including facial features, body proportions, clothing style preferences, and distinctive markings or accessories. The system generates detailed character sheets on first creation that serve as reference templates for all future illustrations.

### Personality Consistency Requirements
Character personalities, speech patterns, favorite activities, fears, and relationships with other characters must remain consistent across stories. The system maintains personality profiles that include behavioral traits, common phrases, and character motivations that inform story generation.

### Character Evolution Guidelines
While maintaining core consistency, characters can show appropriate growth and learning across stories. New experiences should build upon established character traits rather than contradicting them. Character development should be age-appropriate and reflect the lessons learned in previous stories.

### Style Guide Implementation
All characters follow the specified Pixar-like aesthetic with expressive friendly faces, large round eyes, rosy cheeks, and gentle smiles. Animal characters wear charming accessories like oversized glasses, cozy sweaters, and small backpacks. Illustrations use warm soft lighting with rich vivid colors that create an inviting storybook atmosphere.

## Monetization Model

### Free Plan
Costs zero dollars and includes three stories per month with one image per story. It supports one child profile, provides low-resolution artwork, and includes reading progress sync. This tier is designed to give just enough magic to hook new families without overwhelming infrastructure costs.

### Starter Plan
Costs four dollars and ninety-nine cents per month or forty-nine dollars and ninety-nine cents per year and offers thirty stories per month, each with three images. It includes high-definition images, supports up to three child profiles, character creation and consistency features, and prioritizes story generation in the queue. This tier mirrors BedtimeStory.ai's thirty-story offering but undercuts its effective eight dollars and twenty-five cents monthly rate.

### Premium Plan
Costs nine dollars and ninety-nine cents per month or eighty-nine dollars and ninety-nine cents per year and includes one hundred stories per month with five images each. It supports unlimited child profiles, advanced character customization, offers audio narration and offline reading mode, and unlocks early-access features. This plan keeps heavy users profitable while matching Oscar's competitive coin-plus-subscription strategy.

### Family Lifetime Plan
Costs a one-time fee of one hundred forty-nine dollars and includes one hundred stories per month with all Premium features for life. It also includes one free printed hardcover book per year with custom characters (shipping not included). This plan offsets long-term infrastructure costs while solving the awkward value conflict between unlimited monthly usage and capped lifetime access.

### Pay-as-you-go Credits
Allows users to purchase twenty-five additional stories for nine dollars and ninety-nine cents. These credits stack with any existing plan and work well as gifts. This satisfies occasional users who prefer not to commit to a subscription, similar to the coin-based model used in Storybook AI.

Story credits roll over for up to ninety days to reduce the risk of perceived breakage and improve retention.

## Implementation Timeline

### Minimum Viable Product (6 weeks)
Story generation with basic character creation, image generation with character consistency prompts, Wasabi integration, basic auth, character profile storage, and the free tier implementation. Core UI/UX with vibrant design theme and basic transitions.

### Beta Phase (4 weeks)
Subscriptions integration, advanced character customization features, recommendation engine with character preferences, full analytics including character consistency metrics, and enhanced UI transitions and animations.

### General Availability (2 weeks)
Stabilization, marketing push, character consistency optimization, and full design polish with advanced animations and transitions.

### Phase Two Roadmap (8 weeks)
Multilingual output with character name localization, audio narration with character voice consistency using OpenAI TTS or ElevenLabs, print-book workflow with custom character integration, and advanced character development features including character relationships and story arcs.

## Technical Requirements

### Character Consistency Engine
A dedicated service that maintains character profiles, generates consistent illustration prompts, validates character consistency across stories, and provides character development suggestions. This engine interfaces with the story generation API to inject character-specific context and maintains a character embedding system for consistency scoring.

### Design System Implementation
A comprehensive design system with defined color palettes, typography scales, animation libraries, and component patterns that ensure consistent visual experience across all platform touchpoints. The system includes age-appropriate design variations and accessibility compliance features.

### Performance Standards
Character data retrieval must complete within two hundred milliseconds, character-consistent story generation must complete within eight seconds end-to-end, and character illustration generation must maintain visual consistency score above ninety percent as measured by automated comparison algorithms.

## Risks and Mitigations

Inappropriate AI output is mitigated by OpenAI moderation plus a parent report mechanism with rapid takedown and character profile review. Character consistency challenges are addressed through robust character profiling, automated consistency scoring, and manual review processes. Illustration costs are managed by offering a text-only toggle and low-resolution previews with on-demand upscaling for subscribers. COPPA exposure is minimized via verified-guardian consent screens, character data protection protocols, and yearly third-party audits. Competitive pressure is addressed through superior character consistency, reading-progress sync, the Wasabi-backed unlimited library, custom character creation, and a tangible print product featuring personalized characters that few rivals provide.

## Success Metrics

Primary metrics include character consistency scores above ninety-five percent, character reuse rate across stories above seventy percent, user engagement with character customization features above sixty percent of active users, and retention improvement of twenty percent compared to platforms without character consistency. Secondary metrics track character creation completion rates, multi-story series engagement, and character-based story recommendation click-through rates.

## Open Questions

Should a web-only classroom edition with shared character libraries be included at launch or deferred? Does Apple's App Store guideline require sign-in-with-Apple from day one? Which TTS vendor offers the best price-to-quality trade-off for character voice consistency at predicted scale? How should character intellectual property be handled for user-created characters? Should character trading or sharing between families be considered for future versions?

This comprehensive PRD contains all essential product, technical, and business details including character consistency requirements, custom character creation features, updated pricing structure, and vibrant design specifications ready for development implementation.