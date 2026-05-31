/**
 * ContactsManager.tsx — Emergency contacts connected to backend API
 *
 * Uses /api/contacts endpoints — contacts stored in MongoDB.
 * Falls back to localStorage if backend is unavailable (offline mode).
 *
 * Backend auto-verifies contacts on add (no OTP needed for demo).
 */

import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardContent, IonItem, IonInput, IonLabel,
  IonButton, IonIcon, IonText, IonToast, IonAlert
} from '@ionic/react';
import {
  personAddOutline, trashOutline, checkmarkCircleOutline,
  callOutline, shieldCheckmarkOutline, refreshOutline
} from 'ionicons/icons';
import {
  apiGetContacts, apiAddContact, apiDeleteContact, getToken
} from '../../services/api';
import {
  getContacts, addContact, removeContact, Contact
} from '../../utils/storage';

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
  .cm-contact-row {
    display: flex; align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--clr-primary-tint);
    animation: fadeIn 0.3s ease both;
    min-width: 0;
  }
  .cm-contact-row:last-child { border-bottom: none; }
  .cm-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--clr-primary-light), var(--clr-primary));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: white;
    box-shadow: 0 2px 8px rgba(46,125,50,0.25);
  }
  .cm-contact-info {
    flex: 1; min-width: 0; overflow: hidden;
  }
  .cm-contact-info p {
    white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; margin: 0;
  }
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
  .cm-empty {
    text-align: center;
    padding: var(--space-xl) var(--space-md);
    color: var(--clr-text-muted);
  }
  .cm-mode-badge {
    font-size: 11px; padding: 3px 8px; border-radius: 10px;
    font-weight: 700; margin-bottom: var(--space-sm);
    display: inline-block;
  }
  .cm-mode-online  { background: var(--clr-primary-tint); color: var(--clr-primary); }
  .cm-mode-offline { background: var(--clr-warning-tint); color: var(--clr-warning); }
`;

// Unified contact shape for display
interface DisplayContact {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
  source: 'backend' | 'local';
}

const ContactsManager: React.FC = () => {
  const [contacts, setContacts]   = useState<DisplayContact[]>([]);
  const [newName, setNewName]     = useState('');
  const [newPhone, setNewPhone]   = useState('');
  const [addError, setAddError]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg]   = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [isOnline, setIsOnline]   = useState(false); // true if backend is reachable

  // Load contacts — try backend first, fall back to localStorage
  const loadContacts = async () => {
    const token = getToken();
    if (token) {
      try {
        const data = await apiGetContacts();
        // Backend returns array of contact objects
        const mapped: DisplayContact[] = data.map((c: any) => ({
          id:       c._id || c.id,
          name:     c.name,
          phone:    c.phone,
          verified: c.verified,
          source:   'backend' as const,
        }));
        setContacts(mapped);
        setIsOnline(true);
        return;
      } catch {
        // Backend unreachable — fall through to localStorage
      }
    }
    // Offline fallback
    const local = getContacts();
    setContacts(local.map(c => ({ ...c, source: 'local' as const })));
    setIsOnline(false);
  };

  useEffect(() => { loadContacts(); }, []);

  const handleAdd = async () => {
    if (!newName.trim())             { setAddError('Please enter a name'); return; }
    if (newPhone.trim().length < 10) { setAddError('Enter a valid phone number'); return; }
    setAddError('');
    setLoading(true);

    const token = getToken();
    if (token && isOnline) {
      // Add to backend
      try {
        await apiAddContact(newName.trim(), newPhone.trim());
        setNewName(''); setNewPhone('');
        await loadContacts();
        setToastMsg('Contact added ✓'); setToastColor('success'); setShowToast(true);
      } catch (err: any) {
        setAddError(err.message || 'Failed to add contact');
      }
    } else {
      // Offline — add to localStorage
      addContact(newName.trim(), newPhone.trim());
      setNewName(''); setNewPhone('');
      await loadContacts();
      setToastMsg('Contact saved locally (offline mode)');
      setToastColor('warning'); setShowToast(true);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, source: 'backend' | 'local') => {
    if (source === 'backend') {
      try {
        await apiDeleteContact(id);
        await loadContacts();
        setToastMsg('Contact removed'); setToastColor('success'); setShowToast(true);
      } catch (err: any) {
        setToastMsg(err.message || 'Failed to remove'); setToastColor('danger'); setShowToast(true);
      }
    } else {
      removeContact(id);
      await loadContacts();
      setToastMsg('Contact removed'); setToastColor('success'); setShowToast(true);
    }
  };

  const contactToDelete = contacts.find(c => c.id === deleteId);

  return (
    <>
      <style>{styles}</style>

      {/* Mode indicator */}
      <span className={`cm-mode-badge ${isOnline ? 'cm-mode-online' : 'cm-mode-offline'}`}>
        {isOnline ? '🟢 Connected to server' : '🟡 Offline — saving locally'}
      </span>

      {/* Add contact card */}
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
              <p style={{ fontSize: 'var(--font-xs)', margin: '0 0 var(--space-sm)', fontWeight: 600 }}>{addError}</p>
            </IonText>
          )}
          <IonButton expand="block" onClick={handleAdd} disabled={loading}
            style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-sm)', height: '50px', fontWeight: 700, fontSize: 'var(--font-md)' }}>
            <IonIcon icon={personAddOutline} slot="start" />
            {loading ? 'Adding…' : 'Add Contact'}
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Refresh button */}
      <IonButton fill="clear" size="small" onClick={loadContacts}
        style={{ '--color': 'var(--clr-primary-muted)', marginBottom: 'var(--space-sm)' }}>
        <IonIcon icon={refreshOutline} slot="start" />
        Refresh
      </IonButton>

      {/* Contact list */}
      {contacts.length === 0 ? (
        <div className="cm-empty">
          <IonIcon icon={callOutline} style={{ fontSize: '48px', opacity: 0.3 }} />
          <p style={{ margin: '10px 0 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>No contacts yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)' }}>Add someone above to receive your SOS alerts</p>
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
                    : <span className="badge-pending">Pending verification</span>
                  }
                  {c.source === 'local' && (
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                      Saved locally — will sync when online
                    </span>
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
          { text: 'Remove', role: 'destructive', handler: () => {
            if (deleteId && contactToDelete) handleDelete(deleteId, contactToDelete.source);
          }}
        ]} />

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)}
        message={toastMsg} duration={3000} color={toastColor} position="bottom" />
    </>
  );
};

export default ContactsManager;
