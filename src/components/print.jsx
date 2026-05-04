import React from 'react';
import { WC, MISSIONS, RANGED, MELEE, UPGRADES, DEFENSIVE, FACTIONS, TEAMS } from '../data';
import { calcMech, valForClass, totalWeaponCost, findAsset } from '../calc';

export function PrintView({
  forceName, mission, customTons, mechs,
  supportAssets, faction, perks, selectedTeams,
}) {
  const useCustom = mission === 'Custom';
  const cap = useCustom ? customTons : MISSIONS[mission].tons;
  const totalTons =
    mechs.reduce((s, m) => s + calcMech(m).totalUsed, 0) +
    supportAssets.reduce((s, n) => s + (findAsset(n)?.cost || 0), 0);

  const factionData = faction ? FACTIONS[faction] : null;
  const teamObjs = selectedTeams.map(n => TEAMS.find(t => t.name === n)).filter(Boolean);

  return (
    <div className="print-only" style={{
      padding: '16mm',
      fontFamily: 'var(--font-body)',
      color: '#000', background: '#fff',
      fontSize: 11.5, lineHeight: 1.45,
    }}>
      <div style={{
        borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div className="display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.04em' }}>
            {forceName || 'Unnamed Force'}
          </div>
          <div className="mono" style={{ fontSize: 10, color: '#444', marginTop: 4 }}>
            STEEL RIFT // FORGE — v1.5 — {new Date().toLocaleDateString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="display" style={{ fontSize: 13, letterSpacing: '0.18em' }}>
            {useCustom ? 'CUSTOM' : mission.toUpperCase()}
          </div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {totalTons} / {cap}t
          </div>
        </div>
      </div>

      {factionData && (
        <div style={{ marginBottom: 12 }}>
          <div className="display" style={{ fontSize: 10, letterSpacing: '0.16em' }}>FACTION</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{faction}</div>
          {perks.length > 0 && (
            <div style={{ fontSize: 11, marginTop: 2 }}>
              <em>Perks:</em> {perks.join(' · ')}
            </div>
          )}
          <div style={{ fontSize: 10.5, color: '#333', marginTop: 2 }}>
            <em>Faction Agenda:</em> {factionData.agenda}
          </div>
        </div>
      )}

      {teamObjs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="display" style={{ fontSize: 10, letterSpacing: '0.16em' }}>TEAMS</div>
          {teamObjs.map(t => (
            <div key={t.name} style={{ fontSize: 11, marginTop: 4 }}>
              <strong>{t.name}</strong> <span style={{ color: '#555' }}>(band {t.band})</span>
              <div style={{ fontSize: 10.5, color: '#333' }}>{t.agenda}</div>
            </div>
          ))}
        </div>
      )}

      {mechs.map((m, i) => {
        const stats = calcMech(m);
        return (
          <div key={m.id} style={{
            marginBottom: 14, paddingBottom: 8,
            borderBottom: '1px solid #999', breakInside: 'avoid',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="display" style={{ fontSize: 14, letterSpacing: '0.06em' }}>
                {String(i + 1).padStart(2, '0')} — {m.name || 'Unnamed'} <span style={{ fontSize: 10, color: '#555' }}>({m.weightClass})</span>
              </div>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>
                {stats.totalUsed}/{WC[m.weightClass].tons}t
              </div>
            </div>
            {m.description && <div style={{ fontSize: 10.5, color: '#444', fontStyle: 'italic' }}>{m.description}</div>}
            <div className="mono" style={{ fontSize: 10.5, marginTop: 4 }}>
              ARM {stats.effectiveArmor} · STR {stats.structure} · {stats.totalSlotsUsed}/{stats.capSlots} slots
            </div>
            {m.weapons.length > 0 && (
              <div style={{ fontSize: 11, marginTop: 4 }}>
                <strong>Weapons:</strong>{' '}
                {m.weapons.map(w => {
                  const def = [...RANGED, ...MELEE].find(x => x.name === w.name);
                  const total = def ? totalWeaponCost(def, m.weightClass, w.count) : 0;
                  return `${w.name}${w.count > 1 ? ` ×${w.count}` : ''} (${total}t)`;
                }).join(', ')}
              </div>
            )}
            {m.upgrades.length > 0 && (
              <div style={{ fontSize: 11, marginTop: 2 }}>
                <strong>Upgrades:</strong>{' '}
                {m.upgrades.map(u => {
                  const def = UPGRADES.find(x => x.name === u);
                  const c = def ? valForClass(def.cost, m.weightClass) : '?';
                  return `${u} (${c}t)`;
                }).join(', ')}
              </div>
            )}
            {m.defensive.length > 0 && (
              <div style={{ fontSize: 11, marginTop: 2 }}>
                <strong>Defensive:</strong>{' '}
                {m.defensive.map(d => {
                  const def = DEFENSIVE.find(x => x.name === d);
                  const c = def ? valForClass(def.cost, m.weightClass) : '?';
                  return `${d} (${c}t)`;
                }).join(', ')}
              </div>
            )}
          </div>
        );
      })}

      {supportAssets.length > 0 && (
        <div>
          <div className="display" style={{ fontSize: 12, letterSpacing: '0.16em', marginBottom: 4 }}>
            SUPPORT ASSETS
          </div>
          {supportAssets.map(n => {
            const a = findAsset(n);
            if (!a) return null;
            return (
              <div key={n} style={{ fontSize: 11.5, marginBottom: 4 }}>
                <strong>{a.name}</strong> ({a.cost}t, {a.kind}) — {a.summary}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
