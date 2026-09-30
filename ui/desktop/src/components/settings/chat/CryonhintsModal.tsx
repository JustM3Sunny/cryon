import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Check } from '../../icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { errorMessage } from '../../../utils/conversionUtils';
import { defineMessages, useIntl } from '../../../i18n';

const i18n = defineMessages({
  dialogTitle: {
    id: 'cryonhintsModal.dialogTitle',
    defaultMessage: 'Configure Project Hints (.cryonhints)',
  },
  dialogDescription: {
    id: 'cryonhintsModal.dialogDescription',
    defaultMessage:
      'Provide additional context about your project to improve communication with Cryon',
  },
  helpText1: {
    id: 'cryonhintsModal.helpText1',
    defaultMessage:
      '.cryonhints is a text file used to provide additional context about your project and improve the communication with Cryon.',
  },
  helpText2: {
    id: 'cryonhintsModal.helpText2',
    defaultMessage:
      "Please make sure {bold} extension is enabled in the extensions page. This extension is required to use .cryonhints. You'll need to restart your session for .cryonhints updates to take effect.",
  },
  helpText3: {
    id: 'cryonhintsModal.helpText3',
    defaultMessage: 'See {link} for more information.',
  },
  helpTextLink: {
    id: 'cryonhintsModal.helpTextLink',
    defaultMessage: 'using .cryonhints',
  },
  errorReading: {
    id: 'cryonhintsModal.errorReading',
    defaultMessage: 'Error reading .cryonhints file: {error}',
  },
  fileFound: {
    id: 'cryonhintsModal.fileFound',
    defaultMessage: '.cryonhints file found at: {filePath}',
  },
  fileCreating: {
    id: 'cryonhintsModal.fileCreating',
    defaultMessage: 'Creating new .cryonhints file at: {filePath}',
  },
  placeholder: {
    id: 'cryonhintsModal.placeholder',
    defaultMessage: 'Enter project hints here...',
  },
  savedSuccessfully: {
    id: 'cryonhintsModal.savedSuccessfully',
    defaultMessage: 'Saved successfully',
  },
  close: {
    id: 'cryonhintsModal.close',
    defaultMessage: 'Close',
  },
  saving: {
    id: 'cryonhintsModal.saving',
    defaultMessage: 'Saving...',
  },
  save: {
    id: 'cryonhintsModal.save',
    defaultMessage: 'Save',
  },
  failedToAccess: {
    id: 'cryonhintsModal.failedToAccess',
    defaultMessage: 'Failed to access .cryonhints file',
  },
  failedToSave: {
    id: 'cryonhintsModal.failedToSave',
    defaultMessage: 'Failed to save .cryonhints file',
  },
  developer: {
    id: 'cryonhintsModal.developer',
    defaultMessage: 'Developer',
  },
});

const HelpText = () => {
  const intl = useIntl();

  return (
    <div className="text-sm flex-col space-y-4 text-text-secondary">
      <p>{intl.formatMessage(i18n.helpText1)}</p>
      <p>
        {intl.formatMessage(i18n.helpText2, {
          bold: <span className="font-bold">{intl.formatMessage(i18n.developer)}</span>,
        })}
      </p>
      <p>
        {intl.formatMessage(i18n.helpText3, {
          link: (
            <Button
              variant="link"
              className="text-blue-500 hover:text-blue-600 p-0 h-auto"
              onClick={() =>
                window.open(
                  'https://cryon-docs.ai/docs/guides/using-cryonhints/',
                  '_blank'
                )
              }
            >
              {intl.formatMessage(i18n.helpTextLink)}
            </Button>
          ),
        })}
      </p>
    </div>
  );
};

const ErrorDisplay = ({ error }: { error: Error }) => {
  const intl = useIntl();

  return (
    <div className="text-sm text-text-secondary">
      <div className="text-red-600">
        {intl.formatMessage(i18n.errorReading, { error: errorMessage(error) })}
      </div>
    </div>
  );
};

const FileInfo = ({ filePath, found }: { filePath: string; found: boolean }) => {
  const intl = useIntl();

  return (
    <div className="text-sm font-medium mb-2">
      {found ? (
        <div className="text-green-600">
          <Check className="w-4 h-4 inline-block" />{' '}
          {intl.formatMessage(i18n.fileFound, { filePath })}
        </div>
      ) : (
        <div>{intl.formatMessage(i18n.fileCreating, { filePath })}</div>
      )}
    </div>
  );
};

interface CryonhintsModalProps {
  directory: string;
  setIsCryonhintsModalOpen: (isOpen: boolean) => void;
}

export const CryonhintsModal = ({ directory, setIsCryonhintsModalOpen }: CryonhintsModalProps) => {
  const intl = useIntl();
  const cryonhintsFilePath = `${directory}/.cryonhints`;
  const [cryonhintsFile, setCryonhintsFile] = useState<string>('');
  const [cryonhintsFileFound, setCryonhintsFileFound] = useState<boolean>(false);
  const [cryonhintsFileReadError, setCryonhintsFileReadError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchCryonhintsFile = async () => {
      try {
        const { file, error, found } = await window.electron.readCryonhints();
        setCryonhintsFile(file);
        setCryonhintsFileFound(found);
        setCryonhintsFileReadError(error ?? '');
      } catch (error) {
        console.error('Error fetching .cryonhints file:', error);
        setCryonhintsFileReadError(intl.formatMessage(i18n.failedToAccess));
      }
    };
    if (directory) fetchCryonhintsFile();
  }, [directory, intl]);

  const writeFile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const saved = await window.electron.writeCryonhints(cryonhintsFile);
      if (!saved) {
        throw new Error('Unable to save .cryonhints');
      }
      setSaveSuccess(true);
      setCryonhintsFileFound(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error writing .cryonhints file:', error);
      setCryonhintsFileReadError(intl.formatMessage(i18n.failedToSave));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => setIsCryonhintsModalOpen(open)}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{intl.formatMessage(i18n.dialogTitle)}</DialogTitle>
          <DialogDescription>{intl.formatMessage(i18n.dialogDescription)}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-2 pb-4">
          <HelpText />

          <div>
            {cryonhintsFileReadError ? (
              <ErrorDisplay error={new Error(cryonhintsFileReadError)} />
            ) : (
              <div className="space-y-2">
                <FileInfo filePath={cryonhintsFilePath} found={cryonhintsFileFound} />
                <textarea
                  value={cryonhintsFile}
                  className="w-full h-80 border rounded-md p-2 text-sm resize-none bg-background-primary text-text-primary border-border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(event) => setCryonhintsFile(event.target.value)}
                  placeholder={intl.formatMessage(i18n.placeholder)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {saveSuccess && (
            <span className="text-green-600 text-sm flex items-center gap-1 mr-auto">
              <Check className="w-4 h-4" />
              {intl.formatMessage(i18n.savedSuccessfully)}
            </span>
          )}
          <Button variant="outline" onClick={() => setIsCryonhintsModalOpen(false)}>
            {intl.formatMessage(i18n.close)}
          </Button>
          <Button onClick={writeFile} disabled={isSaving}>
            {isSaving ? intl.formatMessage(i18n.saving) : intl.formatMessage(i18n.save)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
