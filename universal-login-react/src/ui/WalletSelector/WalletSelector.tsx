import React, {useState, ChangeEvent} from 'react';
import {DebouncedSuggestionsService, WalletSuggestionAction, WALLET_SUGGESTION_ALL_ACTIONS, SuggestionsService} from '@universal-login/commons';
import UniversalLoginSDK from '@universal-login/sdk';
import {Input} from '../commons/Input';
import {Suggestions} from './Suggestions';
import {renderBusyIndicator} from './BusyIndicator';
import './../styles/walletSelector.css';
import './../styles/walletSelectorDefaults.css';

interface WalletSelector {
  onCreateClick: (...args: any[]) => void;
  onConnectionClick: (...args: any[]) => void;
  sdk: UniversalLoginSDK;
  domains: string[];
  actions?: WalletSuggestionAction[];
  className?: string;
}

export const WalletSelector = ({onCreateClick, onConnectionClick, sdk, domains, actions = WALLET_SUGGESTION_ALL_ACTIONS, className}: WalletSelector) => {
  const [debouncedSuggestionsService] = useState(
    new DebouncedSuggestionsService(new SuggestionsService(sdk, domains, actions))
  );
  const [busy, setBusy] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const [creations, setCreations] = useState<string[]>([]);
  const [, setName] = useState('');

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setName(name);
    setBusy(true);
    debouncedSuggestionsService.getSuggestions(name, suggestions => {
      setConnections(suggestions.connections);
      setCreations(suggestions.creations);
      setBusy(false);
    });
  };

  const renderSuggestions = () =>
    !busy && (connections.length || creations.length) ?
      <Suggestions connections={connections} creations={creations} onCreateClick={onCreateClick} onConnectionClick={onConnectionClick} /> :
      null;

  const getWalletSelectorClass = (className?: string) => className ? className : 'universal-login-default';

  return(
    <div className="universal-login">
      <div className={getWalletSelectorClass(className)}>
        <label htmlFor="loginInput" className="login-input-label">
          <p className="login-input-label-title">Type a nickname you want</p>
          <p className="login-input-label-text">(Or your current username if you’re already own one)</p>
        </label>
        <div className="input-wrapper">
          <Input
            id="loginInput"
            onChange={(event: ChangeEvent<HTMLInputElement>) => update(event)}
            placeholder="bob.example.eth"
            autoFocus
          />
          {renderBusyIndicator(busy)}
        </div>
        {renderSuggestions()}
      </div>
    </div>
  );
};

export default WalletSelector;
