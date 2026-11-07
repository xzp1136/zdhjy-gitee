  (func (;43465;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 f32 f32 f32 f32)
    global.get 0
    i32.const 80
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366767
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356080
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3385828
      call 2180
      i32.const 3385832
      call 2180
      i32.const 3387260
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3361776
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420048
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3429392
      call 2180
      i32.const 3369192
      call 2180
      i32.const 4366767
      i32.const 1
      i32.store8
    end
    i32.const 3369192
    i32.load
    call 1900
    local.tee 6
    local.get 2
    i32.store offset=12
    local.get 6
    local.get 0
    i32.store offset=8
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.const 0
        i32.ge_s
        if  ;; label = @3
          local.get 0
          i32.load offset=56
          local.tee 4
          i32.load offset=12
          local.get 1
          i32.gt_s
          br_if 1 (;@2;)
        end
        local.get 2
        i32.eqz
        br_if 1 (;@1;)
        local.get 2
        i32.load offset=32
        local.get 2
        i32.load offset=20
        local.get 2
        i32.load offset=12
        call_indirect (type 1)
        br 1 (;@1;)
      end
      local.get 4
      local.get 1
      local.get 3
      i32.const -64
      i32.sub
      i32.const 3385832
      i32.load
      call 50458
      block  ;; label = @2
        local.get 3
        i32.load offset=64
        local.tee 5
        if  ;; label = @3
          local.get 5
          i32.load offset=12
          i32.const 0
          i32.gt_s
          br_if 1 (;@2;)
        end
        local.get 6
        i32.load offset=12
        local.tee 2
        i32.eqz
        br_if 1 (;@1;)
        local.get 2
        i32.load offset=32
        local.get 2
        i32.load offset=20
        local.get 2
        i32.load offset=12
        call_indirect (type 1)
        br 1 (;@1;)
      end
      block  ;; label = @2
        local.get 0
        i32.load offset=124
        local.tee 2
        i32.eqz
        br_if 0 (;@2;)
        local.get 2
        i32.const 0
        call 7706
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=124
        i32.const 0
        i32.const 0
        call 7683
      end
      i32.const 3356080
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 0
      i32.const 0
      call 7600
      local.tee 2
      i32.store offset=124
      local.get 5
      i32.load offset=12
      i32.const 0
      i32.gt_s
      if (result i32)  ;; label = @2
        i32.const 0
        local.set 2
        loop  ;; label = @3
          local.get 5
          local.get 2
          local.get 3
          i32.const -64
          i32.sub
          i32.const 3387260
          i32.load
          call 50458
          local.get 3
          i32.load offset=64
          local.set 1
          i32.const 3360788
          i32.load
          local.tee 4
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 4
            call 60460
          end
          block  ;; label = @4
            local.get 1
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            i32.const 0
            local.set 4
            local.get 1
            i32.const 0
            call 48828
            local.tee 1
            if  ;; label = @5
              local.get 1
              i32.const 0
              local.get 1
              i32.load
              i32.const 3361776
              i32.load
              i32.eq
              select
              local.set 4
            end
            i32.const 3360788
            i32.load
            local.tee 1
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 1
              call 60460
            end
            local.get 4
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 4
            i32.const 0
            i32.const 0
            call 7821
            drop
            local.get 3
            i32.const -64
            i32.sub
            local.get 4
            i32.const 0
            call 49493
            local.get 3
            f32.load offset=64
            local.set 8
            local.get 3
            f32.load offset=68
            local.set 9
            local.get 0
            i32.load offset=124
            local.set 1
            local.get 3
            i32.const 56
            i32.add
            local.tee 7
            local.get 3
            f32.load offset=72
            local.tee 10
            f32.const 0x1.2e147ap+0 (;=1.18;)
            f32.mul
            f32.store
            local.get 3
            local.get 7
            i32.load
            i32.store offset=24
            local.get 3
            local.get 9
            f32.const 0x1.2e147ap+0 (;=1.18;)
            f32.mul
            f32.store offset=52
            local.get 3
            local.get 8
            f32.const 0x1.2e147ap+0 (;=1.18;)
            f32.mul
            f32.store offset=48
            local.get 3
            local.get 3
            i64.load offset=48
            i64.store offset=16
            local.get 1
            local.get 2
            f32.convert_i32_s
            f32.const 0x1.99999ap-5 (;=0.05;)
            f32.mul
            local.tee 11
            local.get 4
            local.get 3
            i32.const 16
            i32.add
            f32.const 0x1.eb851ep-4 (;=0.12;)
            i32.const 0
            call 7781
            i32.const 27
            i32.const 3420152
            i32.load
            call 14789
            i32.const 0
            call 7952
            drop
            local.get 0
            i32.load offset=124
            local.set 1
            local.get 3
            i32.const 40
            i32.add
            local.tee 7
            local.get 10
            f32.store
            local.get 3
            local.get 7
            i32.load
            i32.store offset=8
            local.get 3
            local.get 9
            f32.store offset=36
            local.get 3
            local.get 8
            f32.store offset=32
            local.get 3
            local.get 3
            i64.load offset=32
            i64.store
            local.get 1
            local.get 11
            f32.const 0x1.eb851ep-4 (;=0.12;)
            f32.add
            local.get 4
            local.get 3
            f32.const 0x1.99999ap-4 (;=0.1;)
            i32.const 0
            call 7781
            i32.const 6
            i32.const 3420152
            i32.load
            call 14789
            i32.const 0
            call 7952
            drop
          end
          local.get 2
          i32.const 1
          i32.add
          local.tee 2
          local.get 5
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        local.get 0
        i32.load offset=124
      else
        local.get 2
      end
      f32.const 0x1.99999ap-5 (;=0.05;)
      i32.const 0
      call 7663
      drop
      local.get 0
      i32.load offset=124
      local.set 2
      i32.const 3364124
      i32.load
      call 1900
      local.tee 1
      local.get 6
      i32.const 3429392
      i32.load
      i32.const 0
      call 7547
      local.get 2
      local.get 1
      i32.const 3420048
      i32.load
      call 14773
      drop
    end
    local.get 3
    i32.const 80
    i32.add
    global.set 0)
