/**
 * ContactsManager.tsx
 * Add, remove, and OTP-verify emergency contacts.
 * Verification is simulated — future: send real OTP via SMS API.
 */

import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardContent, IonItem, IonLabel, IonInput,
  IonButton, IonIcon, IonText, IonToast, IonAlert
} from '@ionic/react';
import {
  personAddOutline, trashOutline, checkmarkCircleOutline,
  timeOutline, callOutline
} from 'ionicons/icons';
import { Contact, getContacts, addContact, removeContact, verifyContact } from '../../utils/storage';

const cmStyles = `
  .contact-row {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 0; border-bottom: 1px solid var(--light-green);
  }
  .contact-row:last-child { border-bottom: none; }
  .contact-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: var(--light-green); border: 2px solid var(--border-green);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: var(--primary-green);
  }
  .verified-badge {
    font-size: 11px; font-weight: 700; color: var(--primary-green);
    background: var(--light-green); border-radius: 6px;
    padding: 2px 7px; display: inline-block; margin-top: 3px;
  }
  .pending-badge {
    font-size: 11px; font-weight: 700; color: #f57c00;
    background: #fff3e0; border-radius: 6px;
    padding: 2px 7px; display: inline-block; margin-top: 3px;
  }
  .otp-verify-row {
    display: flex; gap: 8px; margin-top: 8px; align-items: center;
  }
  .otp-mini-input {
    flex: 1; padding: 8px 12px; border: 2px solid var(--border-green);
    border-radius: 10px; font-size: 15px; outline: none;
    color: var(--dark-green);
  }
  .otp-mini-input:focus { border-color: var(--primary-green); }
`;

const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addError, setAddError] = useState('');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [pendingOtp, setPendingOtp] = useState<Record<string, string>>({}); // id → simulated OTP
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setContacts(getContacts()); }, []);

  const refresh = () => setContacts(getContacts());

  const handleAdd = () => {
    if (!newName.trim()) { setAddError('Please enter a name'); return; }
    if (newPhone.trim().length < 10) { setAddError('Enter a valid phone number'); return; }
    setAddError('');

    const contact = addContact(newName, newPhone);
    refresh();
    setNewName('');
    setNewPhone('');

    // Simulate sending OTP — TODO: replace with real SMS API
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp(prev => ({ ...prev, [contact.id]: simulatedOtp }));
    console.log(`[OTP] Simulated OTP for ${contact.name} (${contact.phone}): ${simulatedOtp}`);
    setToastMsg(`OTP sent to ${contact.phone} (check console for demo code)`);
    setShowToast(true);
  };

  const handleVerify = (id: string) => {
    const entered = otpInputs[id] || '';
    const expected = pendingOtp[id] || '';
    if (!expected) { setToastMsg('Request a new OTP first'); setShowToast(true); return; }
    if (entered !== expected) { setToastMsg('Wrong code. Try again.'); setShowToast(true); return; }

    verifyContact(id);
    setPendingOtp(prev => { const n = { ...prev }; delete n[id]; return n; });
    setOtpInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
    refresh();
    setToastMsg('✓ Contact verified!');
    setShowToast(true);
  };

  const handleDelete = (id: string) => {
    removeContact(id);
    refresh();
  };

  const resendOtp = (contact: Contact) => {
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtp(prev => ({ ...prev, [contact.id]: simulatedOtp }));
    console.log(`[OTP] Resent OTP for ${contact.name}: ${simulatedOtp}`);
    setToastMsg(`New OTP sent to ${contact.phone}`);
    setShowToast(true);
  };

  return (
    <>
      <style>{cmStyles}</style>

      {/* Add contact form */}
      <IonCard style={{ borderRadius: '16px', margin: '0 0 16px', border: '1px solid var(--border-green)' }}>
        <IonCardContent>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dark-green)', margin: '0 0 12px' }}>
            Add Emergency Contact
          </p>
          <IonItem style={{ '--background': 'white', '--border-radius': '10px', marginBottom: '10px' }}>
            <IonInput
              placeholder="Contact name"
              value={newName}
              onIonChange={e => setNewName(e.detail.value!)}
            />
          </IonItem>
          <IonItem style={{ '--background': 'white', '--border-radius': '10px', marginBottom: '10px' }}>
            <IonInput
              type="tel"
              placeholder="Phone number"
              value={newPhone}
              onIonChange={e => setNewPhone(e.detail.value!)}
            />
          </IonItem>
          {addError && (
            <IonText color="danger">
              <p style={{ fontSize: '13px', margin: '0 0 8px' }}>⚠ {addError}</p>
            </IonText>
          )}
          <IonButton
            expand="block"
            onClick={handleAdd}
            style={{ '--background': 'var(--primary-green)', '--border-radius': '10px' }}
          >
            <IonIcon icon={personAddOutline} slot="start" />
            Add Contact
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Contact list */}
      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--soft-green)' }}>
          <IonIcon icon={callOutline} style={{ fontSize: '40px', opacity: 0.4 }} />
          <p style={{ margin: '8px 0 0', fontSize: '15px' }}>No contacts yet. Add one above.</p>
        </div>
      ) : (
        <IonCard style={{ borderRadius: '16px', margin: '0 0 16px', border: '1px solid var(--border-green)' }}>
          <IonCardContent style={{ padding: '4px 16px' }}>
            {contacts.map(c => (
              <div key={c.id} className="contact-row">
                <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{c.name}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{c.phone}</p>
                  {c.verified
                    ? <span className="verified-badge">✓ Verified</span>
                    : <span className="pending-badge">⏳ Needs verification</span>
                  }
                  {/* OTP verification row for unverified contacts */}
                  {!c.verified && (
                    <div className="otp-verify-row">
                      <input
                        className="otp-mini-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otpInputs[c.id] || ''}
                        onChange={e => setOtpInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                      />
                      <IonButton size="small" onClick={() => handleVerify(c.id)}
                        style={{ '--background': 'var(--primary-green)', '--border-radius': '8px' }}>
                        <IonIcon icon={checkmarkCircleOutline} />
                      </IonButton>
                      <IonButton size="small" fill="outline" onClick={() => resendOtp(c)}
                        style={{ '--border-radius': '8px', '--color': 'var(--soft-green)' }}>
                        <IonIcon icon={timeOutline} />
                      </IonButton>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDeleteId(c.id)}
                  style={{ background: '#fce4ec', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', flexShrink: 0 }}
                >
                  <IonIcon icon={trashOutline} style={{ color: '#c62828', fontSize: '18px' }} />
                </button>
              </div>
            ))}
          </IonCardContent>
        </IonCard>
      )}

      <IonAlert
        isOpen={!!deleteId}
        onDidDismiss={() => setDeleteId(null)}
        header="Remove Contact?"
        message="This contact will no longer receive your emergency alerts."
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Remove', role: 'destructive', handler: () => { if (deleteId) handleDelete(deleteId); } }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMsg}
        duration={3000}
        color="success"
        position="bottom"
      />
    </>
  );
};

export default ContactsManager;
