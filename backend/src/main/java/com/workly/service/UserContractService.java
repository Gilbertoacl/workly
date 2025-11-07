package com.workly.service;

import com.workly.config.MessageConfig;
import com.workly.dto.user.UserContractResponseDTO;
import com.workly.entity.ContractStatus;
import com.workly.entity.User;
import com.workly.entity.UserContract;
import com.workly.repository.UserContractRepository;
import com.workly.repository.UserRepository;
import org.springframework.context.MessageSource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class UserContractService {

    private final UserContractRepository userContractRepository;
    private final UserRepository userRepository;
    private final MessageSource messageSource;

    public UserContractService(UserContractRepository userContractRepository,
                               UserRepository userRepository,
                               MessageSource messageSource) {
        this.userContractRepository = userContractRepository;
        this.userRepository = userRepository;
        this.messageSource = messageSource;
    }

    @Transactional
    public UserContract addContract(String email, String linkHash) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageSource.getMessage("user.notfound", null, Locale.getDefault())
                ));

        boolean exists = userContractRepository.existsByUserAndJobLinkHash(user, linkHash);
        if (exists) {
            throw new DataIntegrityViolationException(
                    messageSource.getMessage("contract.exists", null, Locale.getDefault())
            );
        }

        UserContract contract = new UserContract(null, user, linkHash, ContractStatus.PENDING);
        return userContractRepository.save(contract);
    }

    @Transactional
    public void updateContractStatus(String email, String linkHash, ContractStatus newStatus) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageSource.getMessage("user.notfound", null, Locale.getDefault())
                ));

        UserContract contract = userContractRepository.findByUserAndJobLinkHash(user, linkHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        messageSource.getMessage("contract.notfound", null, Locale.getDefault())
                ));

        contract.setStatus(newStatus);
        userContractRepository.save(contract);
    }

    @Transactional(readOnly = true)
    public List<UserContractResponseDTO> listUserContracts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageSource.getMessage("user.notfound", null, Locale.getDefault())
                ));

        return userContractRepository.findJobsByUser(user.getId());
    }
}

