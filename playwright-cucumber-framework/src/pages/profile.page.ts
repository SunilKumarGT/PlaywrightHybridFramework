import { Page } from 'playwright';
import { BasePage } from './base.page';

export class ProfilePage extends BasePage {
  private readonly selectors = {
    // Display
    displayName:    '[data-testid="display-name"],  .display-name,  .profile-name',
    emailDisplay:   '[data-testid="profile-email"], .profile-email',
    avatarImage:    '[data-testid="avatar-img"],    .avatar-img,    img.avatar',
    // Edit form
    editBtn:        '[data-testid="edit-profile"],  .edit-profile-btn, button.edit',
    firstNameInput: '[data-testid="first-name"],    input[name="firstName"]',
    lastNameInput:  '[data-testid="last-name"],     input[name="lastName"]',
    emailInput:     '[data-testid="email"],         input[name="email"]',
    phoneInput:     '[data-testid="phone"],         input[name="phone"]',
    bioInput:       '[data-testid="bio"],           textarea[name="bio"]',
    saveBtn:        '[data-testid="save-profile"],  button.save-btn, button[type="submit"].profile',
    cancelBtn:      '[data-testid="cancel-edit"],   button.cancel',
    successToast:   '[data-testid="success-toast"], .toast-success, .alert-success',
    errorToast:     '[data-testid="error-toast"],   .toast-error,   .alert-danger',
    // Password change
    changePasswordBtn:   '[data-testid="change-password"], .change-password-btn',
    currentPasswordInput:'[data-testid="current-password"], input[name="currentPassword"]',
    newPasswordInput:    '[data-testid="new-password"],     input[name="newPassword"]',
    confirmNewPassword:  '[data-testid="confirm-password"], input[name="confirmPassword"]',
    updatePasswordBtn:   '[data-testid="update-password"],  button.update-password',
    // Avatar upload
    uploadAvatarInput:   '[data-testid="avatar-upload"],    input[type="file"].avatar',
    // Danger zone
    deleteAccountBtn:    '[data-testid="delete-account"],   .delete-account-btn',
    confirmDeleteInput:  '[data-testid="confirm-delete"],   input[name="confirmDelete"]',
    confirmDeleteBtn:    '[data-testid="confirm-delete-btn"], button.confirm-delete',
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigateToProfile(): Promise<void> {
    await this.navigate('/profile');
  }

  async getDisplayName(): Promise<string> {
    await this.waitForVisible(this.selectors.displayName);
    return this.getText(this.selectors.displayName);
  }

  async getEmail(): Promise<string> {
    return this.getText(this.selectors.emailDisplay);
  }

  async clickEditProfile(): Promise<void> {
    await this.click(this.selectors.editBtn);
    await this.waitForVisible(this.selectors.firstNameInput);
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; bio?: string }): Promise<void> {
    await this.clickEditProfile();
    if (data.firstName) await this.fill(this.selectors.firstNameInput, data.firstName);
    if (data.lastName)  await this.fill(this.selectors.lastNameInput,  data.lastName);
    if (data.phone)     await this.fill(this.selectors.phoneInput,     data.phone);
    if (data.bio)       await this.fill(this.selectors.bioInput,       data.bio);
    await this.click(this.selectors.saveBtn);
    await this.waitForVisible(this.selectors.successToast, 8000);
  }

  async changePassword(current: string, newPass: string): Promise<void> {
    await this.click(this.selectors.changePasswordBtn);
    await this.fill(this.selectors.currentPasswordInput, current);
    await this.fill(this.selectors.newPasswordInput,     newPass);
    await this.fill(this.selectors.confirmNewPassword,   newPass);
    await this.click(this.selectors.updatePasswordBtn);
  }

  async isSuccessToastVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.successToast);
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.successToast, 8000);
    return this.getText(this.selectors.successToast);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.selectors.errorToast, 5000);
    return this.getText(this.selectors.errorToast);
  }

  async cancelEdit(): Promise<void> {
    await this.click(this.selectors.cancelBtn);
  }
}
