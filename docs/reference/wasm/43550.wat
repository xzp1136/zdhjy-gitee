  (func (;43550;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    local.get 2
    i32.const 0
    i32.store
    local.get 3
    i32.const -1
    i32.store
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=84
      i32.eqz
      br_if 0 (;@1;)
      i32.const 0
      local.get 0
      i32.load8_u offset=85
      local.tee 7
      local.get 0
      i32.load offset=64
      local.tee 4
      select
      br_if 0 (;@1;)
      local.get 4
      i32.const 0
      local.get 1
      local.get 4
      i32.ne
      select
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=60
      local.get 0
      i32.load offset=72
      local.tee 6
      local.get 0
      i32.load offset=68
      i32.add
      i32.le_s
      br_if 0 (;@1;)
      block  ;; label = @2
        local.get 7
        i32.eqz
        if  ;; label = @3
          local.get 4
          i32.eqz
          if  ;; label = @4
            local.get 0
            i32.load8_u offset=52
            br_if 3 (;@1;)
          end
          local.get 0
          local.get 1
          i32.store offset=64
          local.get 0
          i32.const 1
          i32.store8 offset=52
          local.get 0
          local.get 6
          i32.const 1
          i32.add
          i32.store offset=72
          br 1 (;@2;)
        end
        local.get 0
        local.get 1
        i32.store offset=64
        local.get 0
        local.get 6
        i32.const 1
        i32.add
        i32.store offset=72
      end
      local.get 2
      local.get 0
      i32.const 0
      call 48735
      i32.store
      local.get 3
      local.get 0
      i32.load offset=48
      i32.store
      i32.const 1
      local.set 5
    end
    local.get 5)
