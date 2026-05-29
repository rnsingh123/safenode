/**
 * ContactsManager.tsx — Add / remove / OTP-verify emergency contacts
 * Logic: unchanged. UI: redesigned with card system.
 * TODO: replace OTP simulation with real SMS API
 */

import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardContent, IonItem, IonInput, IonLabel,
  IonButton, IonIcon, IonText, IonToast, IonAlert
} from '@ionic/react';
import {
  personAddOutline, trashOutline, checkmarkCircleOutline,
  refreshOutline, callOutline, shieldCheckmarkOutline
} from 'ionicons/icons';
import { Contact, getContacts, addContact, removeContact, verifyContact } from '../../utils/storage';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cm-form-header {
    background: linear-gradient(135deg, var(--clr-primary), var(--clr-primary-light));
    padding: var(--space-md) var(--space-md) var(--space-sm);
    display: flex; align-items: center; gap: 10px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  /* Contact row — flex with overflow protection */
  .cm-contact-row {
    display: flex; align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--clr-primary-tint);
    animation: fadeIn 0.3s ease both;
    min-width: 0; /* prevent flex overflow */
  }
  .cm-contact-row:last-child { border-bottom: none; }

  /* Avatar — fixed size, never shrinks */
  .cm-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--clr-primary-light), var(--clr-primary));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: white;
    box-shadow: 0 2px 8px rgba(46,125,50,0.25);
  }

  /* Text column — takes remaining space, clips overflow */
  .cm-contact-info {
    flex: 1;
    min-width: 0; /* critical — allows text to truncate */
    overflow: hidden;
  }
  .cm-contact-info p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  /* Badges */
  .badge-verified {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: var(--font-xs); font-weight: 700;
    color: var(--clr-primary); background: var(--clr-primary-tint);
    border-radius: 20px; padding: 2px 8px; margin-top: 4px;
    white-space: nowrap;
  }
  .badge-pending {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: var(--font-xs); font-weight: 700;
    color: var(--clr-warning); background: var(--clr-warning-tint);
    border-radius: 20px; padding: 2px 8px; margin-top: 4px;
    white-space: nowrap;
  }

  /* OTP row — stacks on very small screens */
  .otp-row {
    display: flex; gap: 6px; margin-top: 8px; align-items: center;
    flex-wrap: nowrap; /* keep on one line */
    min-width: 0;
  }
  .otp-mini {
    flex: 1; min-width: 0; /* shrink if needed */
    padding: 8px 10px;
    border: 2px solid var(--clr-primary-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm); outline: none;
    color: var(--clr-text-primary); background: var(--clr-surface);
    transition: border-color 0.18s;
  }
  .otp-mini:focus { border-color: var(--clr-primary); }

  /* Delete button — fixed size, never shrinks */
  .cm-delete-btn {
    background: var(--clr-alert-tint); border: none;
    border-radius: var(--radius-sm);
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; align-self: flex-start;
    margin-top: 2px;
    transition: transform 0.1s, background 0.15s;
  }
  .cm-delete-btn:active { transform: scale(0.93); background: #f8bbd0; }

  /* Empty state */
  .cm-empty {
    text-align: center;
    padding: var(--space-xl) var(--space-md);
    color: var(--clr-text-muted);
  }
`;

const ContactsManager: React.FC = () => {
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [newName, setNewName]       = useState('');
  const [newPhone, setNewPhone]     = useState('');
  const [addError, setAddError]     = useState('');
  const [otpInputs, setOtpInputs]   = useState<Record<string, string>>({});
  const [pendingOtp, setPendingOtp] = useState<Record<string, string>>({});
  const [showToast, setShowToast]   = useState(false);
  const [toastMsg, setToastMsg]     = useState('');
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  useEffect(() => { setContacts(getContacts()); }, []);
  const refresh = () => setContacts(getContacts());

  const handleAdd = () => {
    if (!newName.trim())             { setAddError('Please enter a name'); return; }
    if (newPhone.trim().length < 10) { setAddError('Enter a valid phone number'); return; }
    setAddError('');
    const contact = addContact(newName, newPhone);
    refresh(); setNewName(''); setNewPhone('');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp(prev => ({ ...prev, [contact.id]: otp }));
    console.log('[OTP] demo code for', contact.name, ':', otp);
    setToastMsg('OTP sent — check console for demo code');
    setShowToast(true);
  };

  const handleVerify = (id: string) => {
    const entered  = otpInputs[id] || '';
    const expected = pendingOtp[id] || '';
    if (!expected)           { setToastMsg('Request a new OTP first'); setShowToast(true); return; }
    if (entered !== expected) { setToastMsg('Wrong code. Try again.'); setShowToast(true); return; }
    verifyContact(id);
    setPendingOtp(prev => { const n = { ...prev }; delete n[id]; return n; });
    setOtpInputs(prev  => { const n = { ...prev }; delete n[id]; return n; });
    refresh();
    setToastMsg('Contact verified!'); setShowToast(true);
  };

  const resendOtp = (c: Contact) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp(prev => ({ ...prev, [c.id]: otp }));
    console.log('[OTP] resent for', c.name, ':', otp);
    setToastMsg('New OTP sent'); setShowToast(true);
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── Add contact card ── */}
      <IonCard style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--clr-primary-border)', margin: '0 0 var(--space-md)', overflow: 'hidden' }}>
        <div className="cm-form-header">
          <IonIcon icon={personAddOutline} style={{ fontSize: '22px', color: 'white' }} />
          <span style={{ fontWeight: 800, fontSize: 'var(--font-md)', color: 'white' }}>Add Emergency Contact</span>
        </div>
        <IonCardContent style={{ padding: 'var(--space-md)' }}>
          <IonItem style={{ '--background': 'var(--clr-bg)', '--border-radius': 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }}>
            <IonLabel position="floating">Full Name</IonLabel>
            <IonInput value={newName} onIonChange={e => setNewName(e.detail.value!)} />
          </IonItem>
          <IonItem style={{ '--background': 'var(--clr-bg)', '--border-radius': 'var(--radius-sm)', marginBottom: 'var(--space-sm)' }}>
            <IonLabel position="floating">Phone Number</IonLabel>
            <IonInput type="tel" value={newPhone} onIonChange={e => setNewPhone(e.detail.value!)} />
          </IonItem>
          {addError && (
            <IonText color="danger">
              <p style={{ fontSize: 'var(--font-xs)', margin: '0 0 var(--space-sm)', fontWeight: 600 }}>
                {addError}
              </p>
            </IonText>
          )}
          <IonButton expand="block" onClick={handleAdd}
            style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-sm)', height: '50px', fontWeight: 700, fontSize: 'var(--font-md)' }}>
            <IonIcon icon={personAddOutline} slot="start" />
            Add Contact
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* ── Contact list ── */}
      {contacts.length === 0 ? (
        <div className="cm-empty">
          <IonIcon icon={callOutline} style={{ fontSize: '48px', opacity: 0.3 }} />
          <p style={{ margin: '10px 0 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>No contacts yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)' }}>Add someone above to receive your alerts</p>
        </div>
      ) : (
        <IonCard style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--clr-primary-border)', margin: '0 0 var(--space-md)' }}>
          <IonCardContent style={{ padding: '4px var(--space-md)' }}>
            {contacts.map(c => (
              <div key={c.id} className="cm-contact-row">
                <div className="cm-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div className="cm-contact-info">
                  <p style={{ fontWeight: 800, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>{c.name}</p>
                  <p style={{ marginTop: '2px', fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)' }}>{c.phone}</p>
                  {c.verified
                    ? <span className="badge-verified"><IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '11px' }} /> Verified</span>
                    : <span className="badge-pending">Needs verification</span>
                  }
                  {!c.verified && (
                    <div className="otp-row">
                      <input className="otp-mini" type="text" inputMode="numeric" maxLength={6}
                        placeholder="Enter OTP"
                        value={otpInputs[c.id] || ''}
                        onChange={e => setOtpInputs(prev => ({ ...prev, [c.id]: e.target.value }))} />
                      <IonButton size="small" onClick={() => handleVerify(c.id)}
                        style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-sm)', flexShrink: 0 }}>
                        <IonIcon icon={checkmarkCircleOutline} />
                      </IonButton>
                      <IonButton size="small" fill="outline" onClick={() => resendOtp(c)}
                        style={{ '--border-radius': 'var(--radius-sm)', '--color': 'var(--clr-primary-muted)', flexShrink: 0 }}>
                        <IonIcon icon={refreshOutline} />
                      </IonButton>
                    </div>
                  )}
                </div>
                <button className="cm-delete-btn" onClick={() => setDeleteId(c.id)}>
                  <IonIcon icon={trashOutline} style={{ color: 'var(--clr-alert)', fontSize: '18px' }} />
                </button>
              </div>
            ))}
          </IonCardContent>
        </IonCard>
      )}

      <IonAlert isOpen={!!deleteId} onDidDismiss={() => setDeleteId(null)}
        header="Remove Contact?"
        message="This contact will no longer receive your emergency alerts."
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Remove', role: 'destructive', handler: () => { if (deleteId) { removeContact(deleteId); refresh(); } } }
        ]} />

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)}
        message={toastMsg} duration={3000} color="success" position="bottom" />
    </>
  );
};

export default ContactsManager;
