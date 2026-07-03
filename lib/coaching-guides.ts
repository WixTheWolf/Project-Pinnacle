import { CoachingGuide } from "@/lib/types";

const yt = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const guide = (tutorial: string, tip: string, trick: string, query: string): CoachingGuide => ({
  tutorial,
  tip,
  trick,
  videoUrl: yt(query)
});

export const CHECKLIST_GUIDES: Record<string, CoachingGuide> = {
  "Cat/Camel x10": guide(
    "Start on hands and knees. Alternate slow spinal rounding and extension for 10 reps.",
    "Move segment by segment and breathe out as you round your spine.",
    "Pause 1 second at end range to loosen stiff back segments before practice.",
    "cat camel exercise tutorial"
  ),
  "90/90 hip rotations x10 per side": guide(
    "Sit in a 90/90 position and rotate knees side to side without using your hands if possible.",
    "Keep chest tall; only rotate as far as your hips allow with no pinching.",
    "If mobility is limited, place hands behind you and gradually remove support over time.",
    "90 90 hip rotations tutorial"
  ),
  "World's Greatest Stretch x5 per side": guide(
    "From a lunge, place inside hand down, rotate chest up, then straighten front leg and repeat.",
    "Take a full breath at each position before switching.",
    "Use this before range sessions to open hips, thoracic spine, and hamstrings together.",
    "worlds greatest stretch tutorial"
  ),
  "Thoracic open books x10 per side": guide(
    "Lie on your side with knees bent. Reach top arm open and rotate upper back while hips stay stacked.",
    "Keep knees pinned down so motion comes from thoracic spine, not low back.",
    "Exhale as arm opens to gain more rotation without forcing range.",
    "thoracic open books exercise tutorial"
  ),
  "Band pull-aparts x20": guide(
    "Hold a light band at chest height and pull apart until shoulder blades squeeze together.",
    "Keep ribs down and shoulders away from ears.",
    "Use slower tempo on the way back to improve postural control.",
    "band pull apart tutorial"
  ),
  "Glute bridges x15": guide(
    "Lie on back, feet flat, drive through heels and lift hips until torso and thighs align.",
    "Squeeze glutes at the top for 1 second without arching low back.",
    "Place a mini-band above knees to improve glute engagement.",
    "glute bridge tutorial"
  ),
  "Wrist CARs x10 each direction": guide(
    "Make a loose fist and slowly draw the largest pain-free circles at the wrist.",
    "Move slowly and keep forearm still so wrist joint does the work.",
    "Run 1–2 circles before each short-game session to reduce wrist stiffness.",
    "wrist cars tutorial"
  ),
  "Shoulder CARs x10": guide(
    "Rotate arm through a full circle overhead and behind body while keeping torso stable.",
    "Move slowly and avoid shrugging your shoulder toward your ear.",
    "Smaller circles with control beat large circles with compensation.",
    "shoulder cars tutorial"
  ),
  "Shoulder CARs": guide(
    "Rotate arm through a controlled, full shoulder circle while keeping torso and ribs stable.",
    "Move slowly and stay in a pain-free range.",
    "Use smaller circles if you feel neck tension or compensation.",
    "shoulder cars tutorial"
  ),
  "Walk 5-10 minutes": guide(
    "Take an easy walk immediately post-round to bring heart rate down gradually.",
    "Breathe through your nose when possible to settle your nervous system.",
    "Use this walk to mentally review only one improvement for next round.",
    "post workout cooldown walk benefits"
  ),
  "Hydrate 20-24 oz": guide(
    "Drink 20–24 oz of water after the round, ideally in the first 20 minutes.",
    "Sip steadily instead of chugging to improve absorption.",
    "Pair with sodium/electrolytes if conditions were hot or you sweat heavily.",
    "hydration after exercise guide"
  ),
  "Add electrolytes": guide(
    "Add an electrolyte packet or tablet to one bottle after play.",
    "Choose options with sodium and low added sugar.",
    "Use electrolytes every 9 holes during tournament rounds to stay ahead of fatigue.",
    "electrolytes for golf hydration"
  ),
  "Protein 30-40g": guide(
    "Eat a recovery meal or shake with 30–40g protein within 60 minutes post-round.",
    "Combine with carbs to restore energy and speed recovery.",
    "Keep a ready-to-drink shake in your bag to avoid missing the window.",
    "post workout protein recovery tutorial"
  ),
  "Foam roll calves/quads/glutes/back": guide(
    "Roll each major lower-body region 30–60 seconds with slow passes.",
    "When you find a tight spot, pause and breathe before moving on.",
    "Do not roll directly on low-back bones; target lats and glutes instead.",
    "foam rolling full body routine tutorial"
  ),
  "Massage gun forearms/shoulders/hips": guide(
    "Use light pressure and short 20–40 second passes per muscle group.",
    "Keep gun moving; avoid staying on one bony area.",
    "Start at lower speed and increase only if tissue relaxes, not tenses.",
    "massage gun recovery tutorial"
  ),
  "Power Plate 5-10 minutes": guide(
    "Use low-to-moderate vibration settings for short mobility and recovery positions.",
    "Stay relaxed and keep sessions brief to avoid over-stimulation.",
    "Use after hydration and light walking, not as your first recovery step.",
    "power plate recovery routine tutorial"
  ),
  "Legs elevated 5 minutes": guide(
    "Lie on your back with lower legs elevated on a bench or wall for 5 minutes.",
    "Breathe slowly into your lower ribs to relax and downshift.",
    "Pair with nasal breathing for faster recovery before sleep.",
    "legs up wall recovery tutorial"
  ),
  "Sleep before 9:30 PM": guide(
    "Set a hard bedtime target and start wind-down 45 minutes before lights out.",
    "Reduce screens and bright light to help faster sleep onset.",
    "Prepare tomorrow’s clothes and bag early so bedtime stays protected.",
    "sleep routine for athletes tutorial"
  ),
  "90/90 switches": guide(
    "Sit in 90/90 and smoothly switch both knees to opposite side with control.",
    "Keep your chest up and move slowly through the hardest position.",
    "Use your hands as support first, then remove support as mobility improves.",
    "90 90 switches tutorial"
  ),
  "Couch stretch": guide(
    "Place rear shin against a wall/bench and front foot in lunge position to stretch hip flexor.",
    "Keep pelvis tucked slightly to avoid low-back arching.",
    "Short 30-second sets per side are usually better tolerated than one long hold.",
    "couch stretch tutorial"
  ),
  "Pigeon stretch": guide(
    "From the floor, place front shin across body and extend opposite leg behind.",
    "Square hips as much as possible and avoid collapsing chest.",
    "Use a yoga block under your front hip if you cannot stay level.",
    "pigeon stretch tutorial"
  ),
  "Hip flexor lunge": guide(
    "Kneeling lunge with rear glute squeezed and torso upright to target front hip.",
    "Keep movement gentle and maintain neutral ribs.",
    "Add light arm reach overhead on same side for deeper stretch.",
    "hip flexor lunge stretch tutorial"
  ),
  "Glute bridge": guide(
    "Drive through heels and lift hips until glutes fully contract.",
    "Do not over-arch low back at the top position.",
    "Add a 2-second pause at top to increase activation without extra load.",
    "glute bridge tutorial"
  ),
  "Lateral band walk": guide(
    "Place mini-band above knees or ankles and step laterally with slight athletic stance.",
    "Keep toes forward and tension constant through the band.",
    "Take smaller controlled steps to keep hips loaded.",
    "lateral band walk tutorial"
  ),
  "Cat/Camel": guide(
    "Cycle between rounded and extended spine while breathing slowly.",
    "Move gently and avoid forcing painful ranges.",
    "Do this before dead bugs and bird dogs for better trunk control.",
    "cat camel exercise tutorial"
  ),
  "Child's pose breathing": guide(
    "Sit back into child’s pose and take slow diaphragmatic breaths.",
    "Exhale fully to relax back and hip tension.",
    "Place hands on stacked fists if shoulder mobility is limited.",
    "childs pose breathing tutorial"
  ),
  "Open books": guide(
    "Side-lying thoracic rotation drill opening top arm across the body.",
    "Keep knees stacked and still.",
    "Use breath and move slightly farther each exhale.",
    "open books thoracic rotation tutorial"
  ),
  "Dead bugs": guide(
    "Lie on back, brace core, and alternate opposite arm/leg extension without arching back.",
    "Keep low back gently pressed into the floor.",
    "Exhale during extension to improve core control.",
    "dead bug exercise tutorial"
  ),
  "Bird dogs": guide(
    "From quadruped, extend opposite arm and leg while keeping hips level.",
    "Move slowly and avoid rotating torso.",
    "Pause 1 second at full reach before returning.",
    "bird dog exercise tutorial"
  ),
  "Side plank": guide(
    "Support body on forearm and side of foot/knee with neutral spine.",
    "Keep hips stacked and neck relaxed.",
    "Short, crisp holds with perfect form beat long sloppy sets.",
    "side plank tutorial"
  ),
  "Band pull-aparts": guide(
    "Pull resistance band apart at chest level with control.",
    "Lead movement with upper back, not neck tension.",
    "Use varied angles (chest, eye-level) to target different fibers.",
    "band pull apart tutorial"
  ),
  "Wall slides": guide(
    "Stand against wall, forearms on wall, and slide arms upward maintaining contact.",
    "Keep ribs down and avoid lower-back arch.",
    "Use slower reps for better shoulder blade mechanics.",
    "wall slides shoulder tutorial"
  ),
  "Scap pushups": guide(
    "In plank, keep elbows straight and move chest by protracting/retracting shoulder blades.",
    "Maintain neutral neck and straight line from head to heels.",
    "Do smaller ranges first to build scapular control.",
    "scap push up tutorial"
  ),
  "External rotation band work": guide(
    "Elbow by side, rotate forearm outward against band resistance.",
    "Keep shoulder relaxed and wrist neutral.",
    "Use high-rep, low-load sets for shoulder endurance.",
    "band external rotation shoulder tutorial"
  ),
  "Wrist CARs": guide(
    "Controlled wrist circles through full pain-free range.",
    "Move slowly and isolate wrist from forearm.",
    "Run a quick set before putting/chipping sessions.",
    "wrist cars tutorial"
  ),
  "Prayer stretch": guide(
    "Place palms together in front of chest and lower hands to stretch wrists.",
    "Keep palms pressed together and shoulders relaxed.",
    "Hold 20–30 seconds with steady breathing.",
    "prayer stretch wrist tutorial"
  ),
  "Reverse prayer stretch": guide(
    "Place backs of hands together and gently raise hands to feel forearm/wrist stretch.",
    "Move only to mild tension, never sharp pain.",
    "Alternate with prayer stretch for balanced wrist mobility.",
    "reverse prayer stretch tutorial"
  ),
  "Forearm extensor stretch": guide(
    "Arm straight, palm down; gently flex wrist with opposite hand until top forearm stretches.",
    "Keep elbow extended and shoulder relaxed.",
    "Great post-range if forearms feel overloaded.",
    "forearm extensor stretch tutorial"
  ),
  "Farmer carry": guide(
    "Hold weights at sides, stand tall, and walk under control for distance.",
    "Keep ribs stacked over pelvis and avoid side-bending.",
    "Use nasal breathing to build trunk control under load.",
    "farmer carry tutorial"
  ),
  "Towel squeeze": guide(
    "Roll a towel and squeeze hard for timed holds or reps.",
    "Keep wrist neutral during each squeeze.",
    "Use as low-impact grip finisher after short-game practice.",
    "towel grip squeeze exercise tutorial"
  ),
  "Goblet Squat 3x8": guide(
    "Hold dumbbell at chest, squat to comfortable depth with upright torso.",
    "Drive knees over toes and keep full foot pressure.",
    "Use slow lowering phase to improve control and mobility.",
    "goblet squat tutorial"
  ),
  "Romanian Deadlift 3x8": guide(
    "Hinge at hips with neutral spine and slight knee bend, then return by driving hips through.",
    "Keep dumbbells close to legs and lats engaged.",
    "Stop when hamstrings are loaded; do not chase floor depth.",
    "romanian deadlift dumbbell tutorial"
  ),
  "Split Squat 3x8 each": guide(
    "Stagger stance and lower under control with torso tall, then drive through front leg.",
    "Track front knee over middle toes.",
    "Use slight forward torso lean to target glute more effectively.",
    "split squat tutorial"
  ),
  "Single-arm Row 3x10": guide(
    "Hinge posture with one hand braced; row dumbbell toward lower ribs.",
    "Keep torso stable and avoid twisting.",
    "Pause briefly at top to reinforce scapular control.",
    "single arm dumbbell row tutorial"
  ),
  "Pallof Press 3x12 each": guide(
    "Stand perpendicular to band/cable anchor and press straight out resisting rotation.",
    "Brace core and keep hips square.",
    "Exhale during press for stronger anti-rotation control.",
    "pallof press tutorial"
  ),
  "Farmer Carry 3x40 yards": guide(
    "Walk with heavy dumbbells at sides while staying tall and stable.",
    "Keep steps short and controlled.",
    "Use this as a trunk durability finisher for late-round posture.",
    "farmer carry tutorial"
  ),
  "Side Plank 3x30 sec": guide(
    "Hold a clean side plank with hips stacked and glutes engaged.",
    "Keep shoulder directly over elbow.",
    "Add top-leg abduction only if base hold is perfect.",
    "side plank tutorial"
  ),
  "Single-leg RDL 3x8 each": guide(
    "Hinge on one leg with hips square while extending back leg for balance.",
    "Keep spine neutral and move slowly.",
    "Touch wall with back foot for balance if needed to keep form clean.",
    "single leg rdl tutorial"
  ),
  "Pushup 3x10": guide(
    "Lower body as one line and press back up under control.",
    "Keep elbows about 30–45° from torso.",
    "Elevate hands on a bench to maintain quality if needed.",
    "push up proper form tutorial"
  ),
  "Pull-up or assisted pull-up 3 sets": guide(
    "Pull chest toward bar while keeping ribs down and shoulders controlled.",
    "Start each rep from dead hang with active shoulders.",
    "Use band assistance to keep smooth full-range reps.",
    "assisted pull up tutorial"
  ),
  "Half-kneeling Dumbbell Press 3x8 each": guide(
    "Press dumbbell overhead from half-kneeling position with glutes and core braced.",
    "Keep front ribs down to avoid low-back compensation.",
    "Use opposite knee down from pressing arm for better trunk stability.",
    "half kneeling dumbbell press tutorial"
  ),
  "Cable/Band Wood Chop 3x10 each": guide(
    "Rotate through torso with controlled chop pattern while hips stay stable.",
    "Initiate movement from core, not only arms.",
    "Slow return phase builds rotational control for golf swings.",
    "cable wood chop tutorial"
  ),
  "Dead Bug 3x10 each": guide(
    "Alternate opposite arm/leg while maintaining core brace and neutral spine.",
    "Keep movement slow and controlled.",
    "Exhale as limb extends to prevent rib flare.",
    "dead bug exercise tutorial"
  ),
  "Suitcase Carry 3x40 yards": guide(
    "Carry one weight on one side and walk while resisting side-bend.",
    "Keep shoulders level and core braced.",
    "Switch hands each set for balanced trunk strength.",
    "suitcase carry tutorial"
  )
};
