import React, {useState, ChangeEvent} from 'react';
import {SuggestionsService, WalletSelectionService } from '@universal-login/commons';
import UniversalLoginSDK from '@universal-login/sdk';
import {Input} from '../commons/Input';
import {Suggestions} from './Suggestions';
import {renderBusyIndicator} from './BusyIndicator';

interface WalletSelector {
  onCreateClick: (...args: any[]) => void;
  onConnectionClick: (...args: any[]) => void;
  sdk: UniversalLoginSDK;
  domains: string[];
}

export const WalletSelector = ({onCreateClick, onConnectionClick, sdk, domains}: WalletSelector) => {
  const walletSelectionService = new WalletSelectionService(sdk, domains);
  const suggestionsService = new SuggestionsService(walletSelectionService);
  const [busy, setBusy] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const [creations, setCreations] = useState<string[]>([]);
  const [, setName] = useState('');

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setName(name);
    setBusy(true);
    suggestionsService.getSuggestions(name, suggestions => {
      setConnections(suggestions.connections);
      setCreations(suggestions.creations);
      setBusy(false);
    });
  };

  const renderSuggestions = () =>
    !busy && (connections.length || creations.length) ?
      <Suggestions connections={connections} creations={creations} onCreateClick={onCreateClick} onConnectionClick={onConnectionClick}/> :
      null;

  return(
    <>
      <label htmlFor="loginInput" className="login-input-label">
        <p className="login-input-label-title">Type a nickname you want</p>
        <p className="login-input-label-text">(Or your current username if you’re already own one)</p>
      </label>
      {renderBusyIndicator(busy)}
      <Input
          id="loginInput"
          onChange={(event: ChangeEvent<HTMLInputElement>) => update(event)}
          placeholder="bob.example.eth"
          autoFocus
      />
      {renderSuggestions()}
    </>
  );
};

export default WalletSelector;
