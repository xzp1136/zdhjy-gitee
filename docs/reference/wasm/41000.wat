  (func (;41000;) (type 6) (param i32 i32 i32 i32)
    local.get 1
    local.get 2
    i32.ne
    if  ;; label = @1
      local.get 0
      local.get 2
      i32.store offset=52
      local.get 0
      i32.load offset=72
      local.tee 1
      if  ;; label = @2
        local.get 0
        local.get 1
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=72
      end
      local.get 0
      i32.load offset=76
      local.tee 1
      if  ;; label = @2
        local.get 0
        local.get 1
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=76
      end
      local.get 0
      local.get 0
      call 40997
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 2
            br_table 0 (;@4;) 1 (;@3;) 2 (;@2;)
          end
          local.get 0
          local.get 0
          call 41001
          return
        end
        local.get 0
        local.get 0
        call 41002
        return
      end
      local.get 0
      i32.load offset=72
      local.tee 2
      if  ;; label = @2
        local.get 0
        local.get 2
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=72
      end
      local.get 0
      i32.load offset=76
      local.tee 2
      if  ;; label = @2
        local.get 0
        local.get 2
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=76
      end
      local.get 0
      local.get 0
      call 40997
    end)
