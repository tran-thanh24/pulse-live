import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Shuffle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useConcertStore } from '../store/concertStore';
import { CharacterFactory } from '../characters/CharacterFactory';
import { CharacterValidator, SCALE_PRESETS } from '../characters/CharacterRules';
import { SKIN_TONES, OUTFIT_COLORS } from '../characters/presets/outfitPresets';
import { HAIR_COLORS, HAIR_PRESETS } from '../characters/presets/hairPresets';
import { ACCESSORY_PRESETS, PULSE_LIGHT_COLORS } from '../characters/presets/accessoryPresets';
import { MALE_PRESETS } from '../characters/presets/malePresets';
import { FEMALE_PRESETS } from '../characters/presets/femalePresets';
import { audioManager } from '../core/AudioManager';
import { showDirector } from '../systems/ShowDirector';

/**
 * AvatarCreator (`src/ui/AvatarCreator.jsx`)
 * Implements:
 * - CHOOSE YOUR CHARACTER: [ MALE ] [ FEMALE ]
 * - 6 Male Presets (`MALE_01..MALE_06`) & 6 Female Presets (`FEMALE_01..FEMALE_06`)
 * - CUSTOMIZE YOUR LOOK with Character Rule Engine validation:
 *   Gender, Body Scale (`SHORT | MEDIUM | TALL`), Skin, Face, Hair, Hair Color, Top, Bottom, Shoes, Outfit Color, Accessory, Pulse Light
 * - RANDOMIZE, RESET, ENTER CONCERT
 */
export function AvatarCreator() {
  const displayName = useUserStore((s) => s.displayName);
  const character = useUserStore((s) => s.character);
  const setDisplayName = useUserStore((s) => s.setDisplayName);
  const updateAvatar = useUserStore((s) => s.updateAvatar);
  const applyCharacterPreset = useUserStore((s) => s.applyCharacterPreset);
  const randomizeAvatar = useUserStore((s) => s.randomizeAvatar);
  const resetAvatar = useUserStore((s) => s.resetAvatar);

  const setScreen = useConcertStore((s) => s.setScreen);

  const [activeTab, setActiveTab] = useState('PRESETS');
  const [ruleFeedback, setRuleFeedback] = useState(null);

  const gender = character?.gender === 'female' ? 'female' : 'male';
  const presets = gender === 'female' ? FEMALE_PRESETS : MALE_PRESETS;

  // Rule-filtered options from CharacterValidator
  const compatibleFaces = useMemo(
    () => CharacterValidator.getCompatibleFaces(gender),
    [gender]
  );
  const compatibleHairs = useMemo(
    () => CharacterValidator.getCompatibleHairs(gender),
    [gender]
  );
  const compatibleTops = useMemo(
    () => CharacterValidator.getCompatibleTops(gender),
    [gender]
  );
  const compatibleBottoms = useMemo(
    () => CharacterValidator.getCompatibleBottoms(gender),
    [gender]
  );
  const compatibleShoes = useMemo(
    () => CharacterValidator.getCompatibleShoes(gender),
    [gender]
  );
  const compatibleAccessories = useMemo(
    () => CharacterValidator.getCompatibleAccessories(gender, character?.hairStyle),
    [gender, character?.hairStyle]
  );

  const handleGenderChange = (newGender) => {
    audioManager.playUISound('click');
    const targetPreset = newGender === 'female' ? FEMALE_PRESETS[0] : MALE_PRESETS[0];
    applyCharacterPreset(targetPreset);
    setRuleFeedback(
      `Switched to ${newGender.toUpperCase()} body proportion, face, hair & outfit presets.`
    );
  };

  const handleEnterConcert = () => {
    audioManager.playUISound('success');
    setScreen('venue');
    showDirector.startPreShowAndConcert(useConcertStore, useUserStore);
  };

  const tabs = [
    { id: 'PRESETS', label: 'Presets (6)' },
    { id: 'BODY_FACE', label: 'Skin & Face' },
    { id: 'HAIR', label: 'Hair' },
    { id: 'OUTFIT', label: 'Top & Bottom' },
    { id: 'SHOES_ACC', label: 'Shoes & Gear' },
    { id: 'LIGHT', label: 'Pulse Light' }
  ];

  return (
    <div className="relative w-full h-full bg-[#070816] flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none">
      {/* Left 3D Character Studio Viewport */}
      <div className="relative w-full lg:w-1/2 h-[370px] sm:h-[430px] lg:h-full bg-gradient-to-b from-[#130d2e] via-[#090b1d] to-[#070816] border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="absolute top-5 left-5 z-10 flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playUISound('click');
              setScreen('ticket');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-heading text-white inline-flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>TICKET</span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[11px] font-heading tracking-[0.2em] text-cyan-300 uppercase">
            3D CHARACTER STUDIO · {gender.toUpperCase()}
          </div>
        </div>

        <Canvas shadows camera={{ position: [0, 1.35, 3.6], fov: 42 }}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 5, 4]} intensity={1.7} castShadow />
          <pointLight position={[-3, 2, -2]} color="#22D3EE" intensity={2.2} />
          <pointLight position={[3, 2, -2]} color="#EC4899" intensity={1.8} />

          <group position={[0, -0.92, 0]}>
            <CharacterFactory
              config={{
                ...character,
                displayName
              }}
              animationState="LIGHTSTICK_IDLE"
              lightstickMode="STATIC"
              showLabel={false}
              isPreview
            />
            <mesh position={[0, -0.05, 0]} receiveShadow>
              <cylinderGeometry args={[1.05, 1.2, 0.1, 36]} />
              <meshStandardMaterial color="#11152c" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.96, 1.04, 36]} />
              <meshBasicMaterial color={character?.lightstick || '#22D3EE'} />
            </mesh>
          </group>
        </Canvas>

        {/* Bottom Overlay: Character Name + Action Buttons */}
        <div className="absolute bottom-4 inset-x-5 flex items-center justify-between pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-[#070816]/85 border border-white/15 backdrop-blur-md">
            <div className="text-[10px] font-heading tracking-widest text-[#22D3EE] uppercase">
              {gender.toUpperCase()} · SCALE {character?.scalePreset || 'MEDIUM'} (
              {character?.scale || 1.0}x)
            </div>
            <div className="text-sm font-heading font-bold text-white flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>{displayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                audioManager.playUISound('click');
                randomizeAvatar(gender);
                setRuleFeedback('Randomized character with 100% Rule Engine compatibility.');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-heading font-semibold text-white inline-flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>RANDOMIZE</span>
            </button>

            <button
              onClick={() => {
                audioManager.playUISound('click');
                resetAvatar(gender);
                setRuleFeedback('Reset character to default gender preset.');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-heading font-semibold text-white inline-flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Customization Panel */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-5 sm:p-8 overflow-y-auto">
        <div className="space-y-5">
          <div>
            <div className="text-xs font-heading tracking-[0.22em] text-[#22D3EE] uppercase">
              CREATE YOUR CONCERT AVATAR
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
              CHOOSE YOUR CHARACTER & LOOK
            </h1>
          </div>

          {/* STEP 1: CHOOSE YOUR CHARACTER: [ MALE ] [ FEMALE ] */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold tracking-[0.18em] text-[#A1A1AA] uppercase">
                CHOOSE YOUR CHARACTER
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-heading">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RULE ENGINE ACTIVE</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`py-3 px-4 rounded-xl font-heading font-bold text-sm tracking-[0.2em] border transition cursor-pointer ${
                  gender === 'male'
                    ? 'bg-gradient-to-r from-[#22D3EE]/25 to-[#8B5CF6]/25 border-[#22D3EE] text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                    : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                }`}
              >
                [ MALE // NAM ]
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`py-3 px-4 rounded-xl font-heading font-bold text-sm tracking-[0.2em] border transition cursor-pointer ${
                  gender === 'female'
                    ? 'bg-gradient-to-r from-[#EC4899]/25 to-[#8B5CF6]/25 border-[#EC4899] text-white shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                    : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                }`}
              >
                [ FEMALE // NỮ ]
              </button>
            </div>

            {/* Display Name & Body Scale Preset (SHORT | MEDIUM | TALL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1">
                  STAGE BADGE NAME
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your fan name..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white font-heading text-xs focus:outline-none focus:border-[#22D3EE] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1">
                  BODY HEIGHT SCALE
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.keys(SCALE_PRESETS).map((scaleKey) => (
                    <button
                      key={scaleKey}
                      type="button"
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({
                          scalePreset: scaleKey,
                          scale: SCALE_PRESETS[scaleKey]
                        });
                      }}
                      className={`py-2 rounded-lg text-[11px] font-heading font-bold border transition cursor-pointer ${
                        (character?.scalePreset || 'MEDIUM') === scaleKey
                          ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {scaleKey}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rule Engine Feedback Banner */}
          {ruleFeedback && (
            <div className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-xs text-cyan-200 flex items-center justify-between">
              <span>{ruleFeedback}</span>
              <button
                onClick={() => setRuleFeedback(null)}
                className="text-[10px] text-cyan-400 hover:text-white ml-2 cursor-pointer"
              >
                OK
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  audioManager.playUISound('hover');
                  setActiveTab(t.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold tracking-wider transition cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-white/[0.04] text-[#A1A1AA] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: 6 Gender-Specific Character Presets (MALE_01..06 / FEMALE_01..06) */}
          {activeTab === 'PRESETS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    audioManager.playUISound('click');
                    applyCharacterPreset(preset);
                    setRuleFeedback(`Applied preset ${preset.label}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    character?.id === preset.id
                      ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                      : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-heading font-bold text-white">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] mt-0.5">{preset.labelVi}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: preset.outfitColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: preset.hairColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tab 2: Skin Tone & Gender-Compatible Face Preset */}
          {activeTab === 'BODY_FACE' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Skin Tone
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {SKIN_TONES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ skinTone: s.color });
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        character?.skinTone === s.color
                          ? 'bg-white/15 border-[#22D3EE]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-white/25"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-[11px] text-white font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  {gender === 'female' ? 'Female Face Sculpt' : 'Male Face Sculpt'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {compatibleFaces.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ facePreset: f.id });
                      }}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        character?.facePreset === f.id
                          ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">{f.label}</div>
                      <div className="text-[11px] opacity-75">{f.labelVi}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Hair Style & Hair Color (With Rule Engine filter) */}
          {activeTab === 'HAIR' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Compatible Hair Styles ({compatibleHairs.length} Valid for {gender.toUpperCase()})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {compatibleHairs.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ hairStyle: h.id });
                        if (h.blocksCap && character?.accessory === 'street-cap') {
                          setRuleFeedback(
                            `Rule Engine: Street Cap automatically swapped because "${h.label}" blocks caps.`
                          );
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        character?.hairStyle === h.id
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">{h.label}</div>
                      <div className="text-[10px] opacity-75">
                        {h.gender === 'unisex' ? 'UNISEX' : `${h.gender.toUpperCase()} ONLY`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Hair Color
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {HAIR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ hairColor: c.color });
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        character?.hairColor === c.color
                          ? 'bg-white/15 border-[#22D3EE]'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] text-white truncate w-full text-center">
                        {c.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Top, Bottom & Outfit Color */}
          {activeTab === 'OUTFIT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                    Top ({gender.toUpperCase()} Compatible)
                  </div>
                  <div className="space-y-1.5">
                    {compatibleTops.map((top) => (
                      <button
                        key={top.id}
                        onClick={() => {
                          audioManager.playUISound('click');
                          updateAvatar({ outfitTop: top.id, outfit: top.id });
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          character?.outfitTop === top.id
                            ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                            : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-heading font-bold">{top.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10">
                          {top.gender}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                    Bottom ({gender.toUpperCase()} Compatible)
                  </div>
                  <div className="space-y-1.5">
                    {compatibleBottoms.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => {
                          audioManager.playUISound('click');
                          updateAvatar({ outfitBottom: bot.id });
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          character?.outfitBottom === bot.id
                            ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white'
                            : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-heading font-bold">{bot.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10">
                          {bot.gender}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Outfit Accent Color
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {OUTFIT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ outfitColor: c.color });
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        character?.outfitColor === c.color
                          ? 'bg-white/15 border-[#22D3EE]'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] text-white truncate w-full text-center">
                        {c.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Shoes & Head/Face Accessory */}
          {activeTab === 'SHOES_ACC' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Footwear / Shoes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {compatibleShoes.map((shoe) => (
                    <button
                      key={shoe.id}
                      onClick={() => {
                        audioManager.playUISound('click');
                        updateAvatar({ shoes: shoe.id });
                      }}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        character?.shoes === shoe.id
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-heading font-bold">{shoe.label}</div>
                      <div className="text-[10px] opacity-75">{shoe.labelVi}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-heading text-[#A1A1AA] uppercase tracking-wider mb-2">
                  Accessory (Filtered by Gender & Hair Conflict Rules)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ACCESSORY_PRESETS.map((acc) => {
                    const isAllowed = compatibleAccessories.some((a) => a.id === acc.id);
                    const hairObj = HAIR_PRESETS.find((h) => h.id === character?.hairStyle);
                    return (
                      <button
                        key={acc.id}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (!isAllowed) return;
                          audioManager.playUISound('click');
                          updateAvatar({ accessory: acc.id });
                        }}
                        className={`p-3 rounded-xl border text-left transition ${
                          !isAllowed
                            ? 'opacity-40 cursor-not-allowed bg-red-500/5 border-red-500/20 text-[#A1A1AA]'
                            : character?.accessory === acc.id
                            ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white cursor-pointer'
                            : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white cursor-pointer'
                        }`}
                      >
                        <div className="text-xs font-heading font-bold">{acc.label}</div>
                        <div className="text-[10px] opacity-75">
                          {!isAllowed
                            ? acc.isCap && hairObj?.blocksCap
                              ? `Blocked by ${hairObj.label}`
                              : `${acc.gender}`
                            : acc.labelVi}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: PULSE LIGHT Color */}
          {activeTab === 'LIGHT' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PULSE_LIGHT_COLORS.map((ls) => (
                <button
                  key={ls.id}
                  onClick={() => {
                    audioManager.playUISound('click');
                    updateAvatar({ lightstick: ls.color, lightstickColor: ls.color });
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                    character?.lightstick === ls.color
                      ? 'bg-white/15 border-white shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full"
                    style={{
                      backgroundColor: ls.color,
                      boxShadow: `0 0 18px ${ls.color}`
                    }}
                  />
                  <span className="text-xs font-heading font-semibold text-white">
                    {ls.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA: ENTER CONCERT */}
        <div className="pt-5 mt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            <span>Saved to LocalStorage (`pulse_character` v1)</span>
          </div>

          <button
            onClick={handleEnterConcert}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] hover:brightness-110 active:scale-[0.98] text-white font-heading font-bold text-sm tracking-[0.2em] shadow-[0_0_32px_rgba(34,211,238,0.45)] inline-flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <span>ENTER CONCERT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
