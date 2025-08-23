## Pagemate Overview

Pagemate is a drop-in SDK that product teams install on their website. When a user asks “How do I…?”, Pagemate either spotlights the exact buttons to click and guides step by step, or, with explicit consent, clicks and fills forms for them (Autopilot). Teams ingest their documents and playbooks, Pagemate converts them into executable flows (RAG + fine-tuning), and tracks completion and deflection.

- Who installs what? Business product/engineering teams install the Pagemate JS SDK and use the Studio to ingest docs and publish flows.
- First customers? Claims-heavy insurers, fintech apps (KYC/account changes), e-commerce (returns/subscriptions), and B2B SaaS admin panels with multi-step setups.
- Result? More tasks completed, fewer support tickets, faster self-serve—with auditable consent and action logs.
- Smart enough to remember information on the end user, and prefills information when needed.

## Problem & Opportunity

**Problems**

- Users get stuck on multi-step, form-heavy tasks (claims, KYC, returns, account changes), and they find it **frustrating to enter the same information** each time repeatedly.
- Existing solutions (FAQs, chatbots, product tours) can explain, but **can’t execute**. They operate only within a limited knowledge base and **fail to function sufficiently for the end-user**.
- Support teams spend costly time repeating the steps users should be able to complete solo.
- Businesses can’t easily **instrument, A/B test, or improve** these help flows.

**Opportunity:** Provide an SDK that understands intent, **guides or executes** the UX safely, and gives teams analytics + knobs to continuously improve.

## Solution overview

### Modes

1. **Guide Mode (default):** Conversational or command-palette UX with live **step highlighting** (spotlight overlay, scroll, focus, tooltip copy).
2. **Autopilot Mode (opt-in):** Agent executes steps (navigate/click/type/submit), with **granular permissions** (e.g., “Allow Pagemate to fill the claim form and submit?”).
    - **Turbo mode (opt-in)**: Agent skips all permission requests and executes until the user's goal has been achieved. All actions performed by Turbo mode are fully logged in an audit trail, allowing users to review the complete execution history after completion for transparency and compliance.

## Server Architecture (You must obey this)
- client layers
  - 최소한의 기능이 구현된 client 레이어 입니다.
  - storage, mongo 등 외부 의존성에 접근하기 위한 low-level API를 제공합니다.
  - 최소한의 외부 의존성을 가져야 하며 가능한 pure function으로 작성되어야 합니다.
  - 또한 최소한의 기능만을 동작해야 합니다.
  - mongo client의 경우 dict를 반환하며 storage client의 경우 bytes를 반환합니다.
  - 이처럼 최소한의 기능만을 제공하여 상위 레이어에서 조합하여 사용합니다.
- service layers
  - client 레이어를 조합하여 비즈니스 로직을 구현합니다.
  - client layer에 대한 의존성을 가지며 그보다 user-friendly 한 인터페이스를 제공합니다.
  - 가령 mongo client에서 받은 dict를 pydantic model로 변환하여 반환하는 등의 작업을 수행합니다.
  - service layer는 비즈니스 로직을 구현하는데 집중해야 하며 외부 의존성에 대한 처리는 client layer에 위임해야 합니다.
- router layers
  - service layer를 조합하여 API endpoint를 구현합니다.
  - End-user가 사용하는 API를 구현하는데 집중해야 하며 비즈니스 로직에 대한 처리는 service layer에 위임해야 합니다.
  - 가능한 한 stateless 하게 작성되어야 합니다.

##
