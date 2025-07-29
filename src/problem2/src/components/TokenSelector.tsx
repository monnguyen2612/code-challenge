import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PriceMap } from '../types';
import { getIconUrl } from '../utils/token';

interface TokenSelectorProps {
  label: string;
  selectedToken: string;
  tokens: string[];
  prices: PriceMap;
  onSelect: (token: string) => void;
  disabled?: boolean;
}

/**
 * Robust reactive TokenIcon component.
 * Fallbacks to a sleek text badge if the SVG loading fails or is in progress.
 */
export const TokenIcon: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state if symbol changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [symbol]);

  return (
    <div className="token-icon-frame" data-testid="token-icon-frame">
      {!hasError && (
        <img
          src={getIconUrl(symbol)}
          alt={symbol}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
          className="token-icon-img"
          style={{ display: isLoading ? 'none' : 'block' }}
          data-testid="token-icon-img"
        />
      )}
      {(hasError || isLoading) && (
        <div className="token-fallback-badge" data-testid="token-icon-fallback">
          {symbol.slice(0, 3).toUpperCase()}
        </div>
      )}
    </div>
  );
};

/**
 * A custom, search-enabled select component that renders a list of 
 * cryptocurrencies with their associated SVG icons and current rates.
 * Adapts to a drawer on mobile and supports keyboard navigation.
 */
export const TokenSelector: React.FC<TokenSelectorProps> = ({
  label,
  selectedToken,
  tokens,
  prices,
  onSelect,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Responsive state detection
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    return tokens.filter(token =>
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  // Reset active keyboard index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredTokens]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  // Focus search box when dropdown/drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery('');
    }
  };

  const handleSelectToken = (token: string) => {
    onSelect(token);
    setIsOpen(false);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredTokens.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredTokens.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredTokens.length) % filteredTokens.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTokens[activeIndex]) {
          handleSelectToken(filteredTokens[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Shared inner search input & token list component
  const renderSelectorContent = () => (
    <>
      <div className="search-box-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search token by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="selector-search-input"
          data-testid="token-search-input"
          aria-label="Search tokens"
        />
      </div>
      <ul className="selector-options-list" role="listbox" aria-label="Token options">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token, index) => (
            <li
              key={token}
              role="option"
              aria-selected={token === selectedToken}
              className={`selector-option-item ${token === selectedToken ? 'selected' : ''} ${
                index === activeIndex ? 'active-keyboard' : ''
              }`}
              onClick={() => handleSelectToken(token)}
              data-testid={`token-option-${token}`}
            >
              <TokenIcon symbol={token} />
              <div className="token-option-text">
                <span className="token-symbol-main">{token}</span>
                <span className="token-price-sub">
                  ${prices[token]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="selector-no-results" data-testid="token-no-results">No tokens found</li>
        )}
      </ul>
    </>
  );

  return (
    <div className="token-selector-container" ref={containerRef} data-testid="token-selector">
      <span className="selector-label">{label}</span>
      <button
        type="button"
        className={`selector-trigger-btn ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="token-selector-trigger"
      >
        <div className="selected-token-info">
          <TokenIcon symbol={selectedToken} />
          <span className="token-symbol">{selectedToken}</span>
        </div>
        <span className="caret-arrow">▼</span>
      </button>

      {/* Desktop Dropdown */}
      {isOpen && !isMobile && (
        <div className="selector-dropdown-menu" data-testid="token-selector-dropdown">
          {renderSelectorContent()}
        </div>
      )}

      {/* Mobile Slide-Up Drawer */}
      {isOpen && isMobile && (
        <>
          <div className="drawer-overlay" onClick={() => setIsOpen(false)} data-testid="token-selector-drawer-overlay" />
          <div className="drawer-content" data-testid="token-selector-drawer">
            <div className="drawer-handle" onClick={() => setIsOpen(false)} />
            <div className="drawer-header">
              <h3 className="drawer-title">Select a Token</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close selector"
              >
                ✕
              </button>
            </div>
            {renderSelectorContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default TokenSelector;
