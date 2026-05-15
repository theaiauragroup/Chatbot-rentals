# Tune AI to Chatbot Integration Plan

## 1. What is the Tune AI Page?

The **Tune AI** page (located at `/tune` in the dashboard) is the control center for shaping the behavior, tone, and boundaries of your AI chatbot. It provides a visual interface for non-technical users to manage the system prompts and guardrails that guide the AI's responses. 

It consists of several key sections:
*   **Personality:** Defines the bot's tone, greeting style, and persona (e.g., professional, friendly, minimalist).
*   **Business Rules:** Dictates how the bot should qualify leads, ask for contact information, and handle specific business scenarios (e.g., pricing, availability).
*   **Knowledge:** The data source the bot uses to answer questions (FAQs, vehicle specs, policies).
*   **Off-Limits:** Topics the bot is strictly forbidden from discussing or must deflect.
*   **Escalation:** Triggers and rules for when the bot should hand off the conversation to a human agent.
*   **Versions & Playground:** Allows users to track changes over time, revert to previous configurations, and test the bot's behavior in a safe sandbox environment before deploying live.

In essence, the Tune AI page is the "brain" editor, while the Chat Widget is the "mouthpiece."

---

## 2. Integration Plan: Connecting Tune AI to the Chatbot

Currently, the Tune AI page is a standalone interface, and the Chat Widget communicates with an external webhook (`n8n`). To bridge these two, we need a robust integration plan.

### Phase 1: Data Persistence (Storing the Tune AI Config)
The configurations set in the Tune AI page need to be saved to a centralized database or Google Sheet so the backend can access them.
*   **Action:** Modify the `SaveBar` and `TuneStore` in the frontend to make an API call when "Publish changes" is clicked.
*   **Action:** Create a backend endpoint (Next.js API route or direct database connection) to receive and store the Tune AI payload. 
*   **Data Structure:** The saved document should include: `personality`, `rules`, `knowledge`, `offLimits`, `escalation`, and a `version_id`.

### Phase 2: Backend Retrieval (n8n Webhook Update)
When a user interacts with the Chat Widget, the frontend sends a payload to the `n8n` webhook. The `n8n` workflow needs to be aware of the active Tune AI configuration.
*   **Option A (Recommended):** The `n8n` workflow is updated to fetch the active Tune AI configuration from the database/Google Sheet at the start of the chat session. It uses this configuration to construct the System Prompt dynamically for the LLM node.
*   **Option B (Pass-through):** The frontend Chat Widget fetches the Tune AI configuration when the widget loads and includes it as a hidden parameter in every webhook request. *(Note: Option A is preferred for security and payload size efficiency).*

### Phase 3: Dynamic Prompt Construction (Inside n8n)
Inside the `n8n` workflow, the LLM node's system prompt must be dynamically generated based on the retrieved Tune AI data.
*   **Action:** Update the `n8n` workflow to map the Tune AI data into a structured system prompt.
    ```markdown
    // Example System Prompt Structure in n8n
    [Personality]: {tune_ai.personality.instructions}
    [Business Rules]: {tune_ai.rules.instructions}
    [Knowledge Base]: {tune_ai.knowledge.context}
    [Off-Limits]: {tune_ai.offLimits.instructions}
    ```

### Phase 4: Playground Synchronization
The "Playground" tab in the Tune AI page should act exactly like the live Chat Widget, but it should test the *draft* or *selected* version of the tuning configuration, not just the currently published live version.
*   **Action:** Ensure the Playground component uses the same webhook endpoint or a dedicated testing endpoint, explicitly passing the draft configuration to verify behavior before publishing.

### Phase 5: Testing & Validation
*   **Test Cases:**
    *   Test tone changes (e.g., change personality to "pirate" and verify).
    *   Test off-limits topics (try to ask about competitors and ensure deflection).
    *   Test escalation (trigger a human handoff rule).
*   **Action:** Verify that changes published in the Tune AI page reflect immediately (or within a caching window) in new chat sessions on the live widget.

---

## 3. Next Steps
1.  **Define Storage:** Decide where the Tune AI settings will live permanently (Google Sheets, Supabase, Vercel KV, etc.).
2.  **API Route:** Build the `/api/tune/save` endpoint to persist the settings.
3.  **n8n Update:** Adjust the n8n webhook workflow to fetch and apply these settings dynamically.
