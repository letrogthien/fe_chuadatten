import AccountInfoForm from './AccountInfoForm';
import UserBillingAddress from './UserBillingAddress';
import UserPreferences from './UserPreferences';






const AccountSettings: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <AccountInfoForm />
            <UserPreferences />
            <UserBillingAddress />
        </div>
    );
};

export default AccountSettings;
