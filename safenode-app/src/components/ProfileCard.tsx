// ========== PROFILE CARD COMPONENT ==========
// Displays user profile information in a card format
// Shows username and contact number with clean UI

import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonText } from '@ionic/react';
import { personCircle, call } from 'ionicons/icons';

// Interface for ProfileCard props
interface ProfileCardProps {
  username: string; // User's username/display name
  contact: string; // User's phone/contact number
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, contact }) => {
  return (
    <IonCard style={{ marginTop: '20px' }}>
      {/* ========== CARD HEADER ========== */}
      <IonCardHeader>
        <IonCardTitle style={{ textAlign: 'center', color: '#3b82f6' }}>
          User Profile
        </IonCardTitle>
      </IonCardHeader>

      {/* ========== CARD CONTENT ========== */}
      <IonCardContent>
        {/* Username Section */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IonIcon icon={personCircle} style={{ fontSize: '24px', color: '#3b82f6' }} />
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>
              Username
            </p>
            <IonText>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>
                {username || 'Not set'}
              </p>
            </IonText>
          </div>
        </div>

        {/* Contact Number Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IonIcon icon={call} style={{ fontSize: '24px', color: '#05b344' }} />
          <div>
            <p style={{ margin: '0 0 5px 0', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>
              Contact Number
            </p>
            <IonText>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>
                {contact || 'Not provided'}
              </p>
            </IonText>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        {/* Profile Status */}
        <div style={{ textAlign: 'center' }}>
          <IonText color="success">
            <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>
              ✓ Profile Verified
            </p>
          </IonText>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProfileCard;
