import { io } from "socket.io-client";

async function runVerification() {
  console.log("=== Starting imspresentation End-to-End WebSocket Verification ===");
  const serverUrl = "http://localhost:4000";

  // Client 1: Presenter Studio
  const presenter = io(serverUrl);
  // Client 2: Projector Presentation Display
  const projector = io(serverUrl);
  // Client 3: Audience Mobile Participant
  const attendee = io(serverUrl);

  let testsPassed = 0;
  const totalTests = 6;

  // 1. Join room test
  await new Promise((resolve) => {
    let joinedCount = 0;
    const checkAllJoined = () => {
      joinedCount++;
      if (joinedCount === 3) {
        console.log("✓ Test 1: All 3 clients (Presenter, Projector, Audience) joined room 'imspresentation'");
        testsPassed++;
        resolve();
      }
    };

    presenter.emit('join-room', { roomId: 'imspresentation', role: 'presenter', name: 'Host' });
    projector.emit('join-room', { roomId: 'imspresentation', role: 'display', name: 'Projector Stage' });
    attendee.emit('join-room', { roomId: 'imspresentation', role: 'audience', name: 'Test Attendee' });

    presenter.once('sync-state', checkAllJoined);
    projector.once('sync-state', checkAllJoined);
    attendee.once('sync-state', checkAllJoined);
  });

  // 2. Slide change sync test
  await new Promise((resolve) => {
    projector.once('slide-changed', ({ currentSlideIndex }) => {
      if (currentSlideIndex === 1) {
        console.log("✓ Test 2: Slide change to index 1 broadcasted to Projector successfully");
        testsPassed++;
        resolve();
      }
    });

    presenter.emit('change-slide', { roomId: 'imspresentation', slideIndex: 1 });
  });

  // 3. Live Poll Voting test
  await new Promise((resolve) => {
    projector.once('poll-updated', (poll) => {
      console.log(`✓ Test 3: Live poll vote recorded. Option 1 votes: ${poll.options[1].votes}`);
      testsPassed++;
      resolve();
    });

    attendee.emit('submit-vote', {
      roomId: 'imspresentation',
      pollId: 'poll-1',
      optionIndex: 1,
      voterId: 'attendee-bot-1',
      voterName: 'Test Attendee'
    });
  });

  // 4. Q&A Submit and Pin to Presentation test
  await new Promise((resolve) => {
    presenter.once('question-added', (newQ) => {
      // Now pin it
      projector.once('questions-synced', (questions) => {
        const pinned = questions.find(q => q.id === newQ.id && q.pinned);
        if (pinned) {
          console.log(`✓ Test 4: Question submitted and pinned to Presentation Stage: "${pinned.text}"`);
          testsPassed++;
          resolve();
        }
      });

      presenter.emit('pin-question', { roomId: 'imspresentation', questionId: newQ.id, pinned: true });
    });

    attendee.emit('submit-question', {
      roomId: 'imspresentation',
      text: 'Can we use imspresentation with hybrid audiences?',
      author: 'Test Attendee',
      isAnonymous: false
    });
  });

  // 5. Live Speech Subtitle Relay test
  await new Promise((resolve) => {
    projector.once('subtitles-updated', (subtitles) => {
      if (subtitles.text.includes("Welcome to the live session")) {
        console.log(`✓ Test 5: Live subtitles streamed to presentation: "${subtitles.text}"`);
        testsPassed++;
        resolve();
      }
    });

    presenter.emit('send-subtitle', {
      roomId: 'imspresentation',
      text: "Welcome to the live session, testing real-time speech subtitles!",
      isFinal: true,
      active: true
    });
  });

  // 6. Floating Reaction burst test
  await new Promise((resolve) => {
    projector.once('reaction-burst', ({ emoji }) => {
      if (emoji === '🔥') {
        console.log(`✓ Test 6: Audience reaction burst received by presentation display: ${emoji}`);
        testsPassed++;
        resolve();
      }
    });

    attendee.emit('send-reaction', { roomId: 'imspresentation', emoji: '🔥' });
  });

  presenter.disconnect();
  projector.disconnect();
  attendee.disconnect();

  console.log(`\n========================================`);
  console.log(`Results: ${testsPassed} / ${totalTests} tests passed!`);
  console.log(`========================================`);
  process.exit(testsPassed === totalTests ? 0 : 1);
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
